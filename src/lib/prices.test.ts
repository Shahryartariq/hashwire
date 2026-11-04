import { describe, expect, it } from "vitest";

import { NETWORKS } from "./networks";
import { byMarketCap, changeInWords, direction, formatCap, formatChange, formatUsd, parsePrices, priceUrl } from "./prices";
import { samplePriceResponse } from "./sample";

describe("prices", () => {
  it("asks CoinGecko for every network with a token in one request", () => {
    const url = new URL(priceUrl());
    expect(url.origin + url.pathname).toBe("https://api.coingecko.com/api/v3/simple/price");
    const ids = url.searchParams.get("ids")!.split(",");
    expect(ids).toHaveLength(NETWORKS.filter((n) => n.coingecko).length);
    expect(ids).toContain("bitcoin");
    expect(url.searchParams.get("include_24hr_change")).toBe("true");
  });

  it("maps CoinGecko's answer to networks", () => {
    const prices = parsePrices(samplePriceResponse(), 0);
    expect(Object.keys(prices)).toHaveLength(21);
    expect(prices.bitcoin.usd).toBeCloseTo(78282.67, 1);
    expect(prices.bitcoin.marketCap).toBeGreaterThan(1e12);
    expect(prices.tron.change24h).toBeLessThan(0);
    expect(prices.bitcoin.updatedAt).toBe(1793793841 * 1000);
    expect(prices.base).toBeUndefined();
  });

  it("skips anything malformed instead of trusting it", () => {
    expect(parsePrices(null, 0)).toEqual({});
    expect(parsePrices("nope", 0)).toEqual({});
    const prices = parsePrices(
      { bitcoin: { usd: "78000" }, ethereum: { usd: -1 }, solana: { usd: 90, usd_24h_change: "x", usd_market_cap: null } },
      5,
    );
    expect(prices.bitcoin).toBeUndefined();
    expect(prices.ethereum).toBeUndefined();
    expect(prices.solana).toEqual({ usd: 90, change24h: null, marketCap: null, updatedAt: 5 });
  });

  it("sorts networks by market cap, with networks without a token last", () => {
    const sorted = byMarketCap(parsePrices(samplePriceResponse(), 0)).map((n) => n.slug);
    expect(sorted.slice(0, 3)).toEqual(["bitcoin", "ethereum", "bnb-chain"]);
    expect(sorted.at(-1)).toBe("base");
  });

  it("formats prices, changes and market caps for reading", () => {
    expect(formatUsd(78282.67)).toBe("$78,283");
    expect(formatUsd(700.6)).toBe("$700.60");
    expect(formatUsd(0.191)).toBe("$0.1910");
    expect(formatUsd(0.0000123456)).toBe("$0.00001235");
    expect(formatChange(1.749)).toBe("+1.7%");
    expect(formatChange(-1.0258)).toBe("−1.0%");
    expect(formatChange(0.01)).toBe("0.0%");
    expect(formatCap(1573533403760)).toBe("$1.57T");
    expect(formatCap(92123256458)).toBe("$92.1B");
    expect(formatCap(256314927)).toBe("$256M");
  });

  it("describes the direction in words for screen readers", () => {
    expect(direction(2.6)).toBe("up");
    expect(direction(-1)).toBe("down");
    expect(direction(0.02)).toBe("flat");
    expect(direction(null)).toBe("flat");
    expect(changeInWords(2.64)).toBe("up 2.6% in 24 hours");
    expect(changeInWords(-1.03)).toBe("down 1.0% in 24 hours");
    expect(changeInWords(null)).toBe("no 24-hour change available");
  });
});
