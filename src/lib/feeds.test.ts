import { afterEach, describe, expect, it, vi } from "vitest";

import { readAllFeeds, readFeed, readPrices, usingSampleData } from "./feeds";
import { SOURCES } from "./sources";

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>T</title>
<item><title>Bitcoin hits a new high</title><link>https://www.coindesk.com/markets/x</link>
<pubDate>${new Date().toUTCString()}</pubDate><description>A long enough description of bitcoin reaching a new all-time high today.</description></item>
</channel></rss>`;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("readFeed", () => {
  it("fetches, parses and cleans a feed with a descriptive user agent", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(RSS, { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const result = await readFeed("coindesk");
    expect(result.ok).toBe(true);
    expect(result.stories[0].title).toBe("Bitcoin hits a new high");
    expect(result.stories[0].networks).toEqual(["bitcoin"]);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://www.coindesk.com/arc/outboundfeeds/rss/");
    expect(init.headers["user-agent"]).toMatch(/^Hashwire\/1\.0 \(\+https:\/\/hashwire\.vercel\.app\/about\)$/);
  });

  it.each([
    ["an HTTP error", () => Promise.resolve(new Response("nope", { status: 403 })), "HTTP 403"],
    ["a page that isn't a feed", () => Promise.resolve(new Response("<html>Just a moment…</html>")), "Not an RSS or Atom feed"],
    ["a timeout", () => Promise.reject(Object.assign(new Error("t"), { name: "TimeoutError" })), "Timed out"],
    ["a network error", () => Promise.reject(new TypeError("fetch failed")), "Could not be read"],
  ])("reports %s without throwing or leaking details", async (_, response, message) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(response));
    const result = await readFeed("coindesk");
    expect(result).toMatchObject({ ok: false, stories: [], error: message });
  });

  it("refuses very large responses", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const big = new Response("x", { headers: { "content-length": String(50 * 1024 * 1024) } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(big));
    expect((await readFeed("coindesk")).error).toBe("Feed is too large");
  });

  it("reports unknown sources", async () => {
    expect((await readFeed("nope")).error).toBe("Unknown source");
  });
});

describe("readPrices", () => {
  it("reads every network's price in one request, with the Demo key when one is set", async () => {
    vi.stubEnv("COINGECKO_API_KEY", "CG-test");
    const fetch = vi.fn().mockResolvedValue(Response.json({ bitcoin: { usd: 78000, usd_24h_change: 1.5, usd_market_cap: 1.5e12 } }));
    vi.stubGlobal("fetch", fetch);
    const prices = await readPrices();
    expect(prices.ok).toBe(true);
    expect(prices.byNetwork.bitcoin.usd).toBe(78000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].headers["x-cg-demo-api-key"]).toBe("CG-test");
  });

  it("works without a key, and reports failures without throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const fetch = vi.fn().mockResolvedValue(new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetch);
    const prices = await readPrices();
    expect(fetch.mock.calls[0][1].headers["x-cg-demo-api-key"]).toBeUndefined();
    expect(prices).toMatchObject({ ok: false, byNetwork: {} });
  });
});

describe("sample data", () => {
  it("is used only when asked for, and never in Vercel production", () => {
    vi.stubEnv("NEWS_SAMPLE_DATA", "1");
    expect(usingSampleData()).toBe(true);
    vi.stubEnv("VERCEL_ENV", "production");
    expect(usingSampleData()).toBe(false);
    vi.stubEnv("NEWS_SAMPLE_DATA", "");
    vi.stubEnv("VERCEL_ENV", "");
    expect(usingSampleData()).toBe(false);
  });

  it("returns every source without touching the network", async () => {
    vi.stubEnv("NEWS_SAMPLE_DATA", "1");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { sample, feeds, prices } = await readAllFeeds();
    expect(sample).toBe(true);
    expect(prices.ok).toBe(true);
    expect(prices.byNetwork.ethereum.usd).toBeGreaterThan(0);
    expect(feeds).toHaveLength(SOURCES.length);
    expect(feeds.every((f) => f.ok && f.stories.length > 0)).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });
});
