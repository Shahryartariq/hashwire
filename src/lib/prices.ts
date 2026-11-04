import { NETWORKS } from "./networks";
import type { Network, Price } from "./types";

export const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";

/** One request for every network's price, 24-hour change and market cap. */
export function priceUrl(): string {
  const ids = NETWORKS.map((n) => n.coingecko).filter(Boolean).join(",");
  const params = new URLSearchParams({
    ids,
    vs_currencies: "usd",
    include_24hr_change: "true",
    include_market_cap: "true",
    include_last_updated_at: "true",
    precision: "full",
  });
  return `${COINGECKO_URL}?${params}`;
}

const finite = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** CoinGecko's response keyed by network slug. Anything malformed is skipped, never trusted. */
export function parsePrices(json: unknown, now: number): Record<string, Price> {
  const out: Record<string, Price> = {};
  if (!json || typeof json !== "object") return out;
  const data = json as Record<string, Record<string, unknown> | undefined>;
  for (const network of NETWORKS) {
    const row = network.coingecko ? data[network.coingecko] : undefined;
    const usd = finite(row?.usd);
    if (!row || usd === null || usd <= 0) continue;
    const updated = finite(row.last_updated_at);
    out[network.slug] = {
      usd,
      change24h: finite(row.usd_24h_change),
      marketCap: finite(row.usd_market_cap),
      updatedAt: updated ? updated * 1000 : now,
    };
  }
  return out;
}

/** Networks with a price first, largest market cap first; the rest keep their menu order. */
export function byMarketCap(prices: Record<string, Price>, networks: Network[] = NETWORKS): Network[] {
  return [...networks].sort((a, b) => (prices[b.slug]?.marketCap ?? -1) - (prices[a.slug]?.marketCap ?? -1));
}

/** "$78,283", "$700.60", "$0.1910", "$0.00001234" */
export function formatUsd(value: number): string {
  if (value >= 1000) return `$${Math.round(value).toLocaleString("en-US")}`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toPrecision(4)}`;
}

/** "+1.7%", "−1.0%" with a true minus sign, "0.0%" for no change. */
export function formatChange(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return "0.0%";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(1)}%`;
}

/** "$1.57T", "$92.1B", "$256M" */
export function formatCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${Math.round(value / 1e6)}M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export type Direction = "up" | "down" | "flat";

export function direction(change: number | null): Direction {
  if (change === null || Math.round(change * 10) === 0) return "flat";
  return change > 0 ? "up" : "down";
}

/** "up 1.7% in 24 hours", for screen readers. */
export function changeInWords(change: number | null): string {
  if (change === null) return "no 24-hour change available";
  const dir = direction(change);
  if (dir === "flat") return "unchanged over 24 hours";
  return `${dir} ${Math.abs(Math.round(change * 10) / 10).toFixed(1)}% in 24 hours`;
}
