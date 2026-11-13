import "server-only";

import { unstable_cache } from "next/cache";

import { FeedError, parseFeed } from "./parse";
import { parsePrices, priceUrl } from "./prices";
import { SAMPLE_NOW, samplePriceResponse, sampleItems } from "./sample";
import { PRODUCTION_URL } from "./site";
import { SOURCES, sourceBySlug } from "./sources";
import { toStories } from "./stories";
import { cleanArticle, readingMinutes, type ReaderText } from "./reader";
import { safeUrl, urlKey } from "./text";
import type { FeedResult, Prices, RawItem } from "./types";

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

/** Downloads one feed's XML. Throws on network errors, HTTP errors and oversized feeds. */
async function fetchFeed(url: string): Promise<string> {
  const response = await fetch(url, {
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
  return xml;
}

/** Reads and cleans one feed. Never throws: a failure is reported in the result. */
export async function readFeed(slug: string): Promise<FeedResult> {
  const source = sourceBySlug(slug);
  const fetchedAt = Date.now();
  if (!source) return { slug, ok: false, fetchedAt, stories: [], error: "Unknown source" };
  try {
    const xml = await fetchFeed(source.feed);
    return { slug, ok: true, fetchedAt, stories: toStories(source, parseFeed(xml), fetchedAt) };
  } catch (error) {
    console.error(`[feeds] ${slug}: ${reason(error)}`);
    return { slug, ok: false, fetchedAt, stories: [], error: reason(error) };
  }
}

/**
 * The text of one story for the reader view, from its source's feed. Null when the story is no
 * longer in the feed or the feed carries only a summary. Throws when the feed can't be read, so a
 * failure is never cached.
 */
async function readArticle(slug: string, url: string): Promise<ReaderText | null> {
  const source = sourceBySlug(slug);
  if (!source) return null;
  const items: RawItem[] = usingSampleData() ? sampleItems(slug) : parseFeed(await fetchFeed(source.feed));
  const key = urlKey(url);
  const item = items.find((i) => {
    const link = safeUrl(i.link, source.homepage);
    return link !== null && urlKey(link) === key;
  });
  if (!item?.body || !readingMinutes(item.body, url)) return null;
  return cleanArticle(item.body, url);
}

/** Articles are cached for an hour: a post's text rarely changes, and each one is a feed download. */
const cachedArticle = unstable_cache(readArticle, ["article", "v1"], { revalidate: 3600, tags: ["articles"] });

/** A story's text for the reader view, or null when there's nothing to show. Never throws. */
export async function getArticle(slug: string, url: string): Promise<ReaderText | null> {
  try {
    return await (usingSampleData() ? readArticle(slug, url) : cachedArticle(slug, url));
  } catch (error) {
    console.error(`[reader] ${slug}: ${reason(error)}`);
    return null;
  }
}

/**
 * Each feed's cleaned stories are cached on their own for 15 minutes, so one slow or broken
 * feed never holds up the others. The cached value is small; the raw XML (up to a few MB) isn't stored.
 */
const cachedFeed = unstable_cache(readFeed, ["feed", "v1"], { revalidate: REFRESH_SECONDS, tags: ["feeds"] });

/**
 * The last copy of a feed that loaded. It refreshes from `cachedFeed` (so it never downloads
 * anything itself) and throws when the latest attempt failed: a fresh entry is then not stored,
 * and a stale one is kept, because Next.js keeps the old value when a background refresh throws.
 */
const lastGoodFeed = unstable_cache(
  async (slug: string): Promise<FeedResult> => {
    const attempt = await cachedFeed(slug);
    if (!attempt.ok) throw new FeedError(attempt.error ?? "Could not be read");
    return attempt;
  },
  ["feed-good", "v1"],
  { revalidate: REFRESH_SECONDS, tags: ["feeds"] },
);

/**
 * A feed's latest attempt; when that failed, the last good copy with `ok: false` and the error,
 * so a source that blocks or times out for an hour keeps its stories instead of vanishing.
 */
export async function feedWithFallback(slug: string): Promise<FeedResult> {
  const attempt = await cachedFeed(slug);
  let good: FeedResult | null = null;
  try {
    good = await lastGoodFeed(slug);
  } catch {
    // No good copy yet.
  }
  return keepLastGood(attempt, good);
}

/** The latest attempt if it worked, else the last good copy marked as stale. Pure, for tests. */
export function keepLastGood(attempt: FeedResult, good: FeedResult | null): FeedResult {
  if (attempt.ok || !good || good.stories.length === 0) return attempt;
  return { ...good, ok: false, stale: true, error: attempt.error, checkedAt: attempt.fetchedAt };
}

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

/**
 * Runs `task` over `items` with at most `limit` running at once, keeping the order. Reading dozens
 * of feeds at the same time makes large ones time out: parsing the others holds up their downloads.
 */
export async function mapLimit<T, R>(items: readonly T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** How many feeds are downloaded at once. */
const CONCURRENT_FEEDS = 8;

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
    mapLimit(SOURCES, CONCURRENT_FEEDS, (source) => feedWithFallback(source.slug)),
    cachedPrices(),
  ]);
  return { now: Date.now(), sample: false, feeds, prices };
}
