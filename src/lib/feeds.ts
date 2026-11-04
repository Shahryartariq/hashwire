import "server-only";

import { unstable_cache } from "next/cache";

import { FeedError, parseFeed } from "./parse";
import { parsePrices, priceUrl } from "./prices";
import { SAMPLE_NOW, samplePriceResponse, sampleItems } from "./sample";
import { PRODUCTION_URL } from "./site";
import { SOURCES, sourceBySlug } from "./sources";
import { toStories } from "./stories";
import type { FeedResult, Prices } from "./types";

/** How often each feed is read again, in seconds. */
export const REFRESH_SECONDS = 15 * 60;
/** How often prices are read again, in seconds. Ten minutes keeps CoinGecko's free plan comfortable. */
export const PRICE_SECONDS = 10 * 60;

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const USER_AGENT = `Hashwire/1.0 (+${PRODUCTION_URL}/about)`;

/** The bundled snapshot instead of live feeds. Never in Vercel production. */
export function usingSampleData(): boolean {
  return process.env.NEWS_SAMPLE_DATA === "1" && process.env.VERCEL_ENV !== "production";
}

function reason(error: unknown): string {
  if (error instanceof FeedError) return error.message;
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) return "Timed out";
  if (error instanceof Error && /^HTTP \d{3}$/.test(error.message)) return error.message;
  return "Could not be read";
}

/** Reads and cleans one feed. Never throws: a failure is reported in the result. */
export async function readFeed(slug: string): Promise<FeedResult> {
  const source = sourceBySlug(slug);
  const fetchedAt = Date.now();
  if (!source) return { slug, ok: false, fetchedAt, stories: [], error: "Unknown source" };
  try {
    const response = await fetch(source.feed, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (Number(response.headers.get("content-length") ?? 0) > MAX_BYTES) throw new FeedError("Feed is too large");
    const xml = await response.text();
    if (xml.length > MAX_BYTES) throw new FeedError("Feed is too large");
    return { slug, ok: true, fetchedAt, stories: toStories(source, parseFeed(xml), fetchedAt) };
  } catch (error) {
    console.error(`[feeds] ${slug}: ${reason(error)}`);
    return { slug, ok: false, fetchedAt, stories: [], error: reason(error) };
  }
}

/**
 * Each feed's cleaned stories are cached on their own for 15 minutes, so one slow or broken
 * feed never holds up the others. The cached value is small; the raw XML (up to a few MB) isn't stored.
 */
const cachedFeed = unstable_cache(readFeed, ["feed", "v1"], { revalidate: REFRESH_SECONDS, tags: ["feeds"] });

/**
 * Prices for every network in one CoinGecko request. A free Demo key (COINGECKO_API_KEY)
 * raises the rate limit but isn't required. Never throws: without prices, pages show none.
 */
export async function readPrices(): Promise<Prices> {
  const fetchedAt = Date.now();
  try {
    const key = process.env.COINGECKO_API_KEY?.trim();
    const response = await fetch(priceUrl(), {
      headers: { accept: "application/json", "user-agent": USER_AGENT, ...(key ? { "x-cg-demo-api-key": key } : {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const byNetwork = parsePrices(await response.json(), fetchedAt);
    return { ok: Object.keys(byNetwork).length > 0, fetchedAt, byNetwork };
  } catch (error) {
    console.error(`[prices] ${reason(error)}`);
    return { ok: false, fetchedAt, byNetwork: {} };
  }
}

const cachedPrices = unstable_cache(readPrices, ["prices", "v1"], { revalidate: PRICE_SECONDS, tags: ["prices"] });

/** Every source's latest stories and every network's price, and the time they count as "now". */
export async function readAllFeeds(): Promise<{ now: number; sample: boolean; feeds: FeedResult[]; prices: Prices }> {
  if (usingSampleData()) {
    const feeds = SOURCES.map((source) => ({
      slug: source.slug,
      ok: true,
      fetchedAt: SAMPLE_NOW,
      stories: toStories(source, sampleItems(source.slug), SAMPLE_NOW),
    }));
    const byNetwork = parsePrices(samplePriceResponse(), SAMPLE_NOW);
    return { now: SAMPLE_NOW, sample: true, feeds, prices: { ok: true, fetchedAt: SAMPLE_NOW, byNetwork } };
  }
  const [feeds, prices] = await Promise.all([
    Promise.all(SOURCES.map((source) => cachedFeed(source.slug))),
    cachedPrices(),
  ]);
  return { now: Date.now(), sample: false, feeds, prices };
}
