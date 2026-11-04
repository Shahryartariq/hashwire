import { XMLParser } from "fast-xml-parser";
import { describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("GET /feed.xml", () => {
  it("returns valid RSS with the latest stories, each linking to the original", async () => {
    vi.stubEnv("NEWS_SAMPLE_DATA", "1");
    const response = await GET();
    expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(response.headers.get("cache-control")).toContain("s-maxage=900");
    const xml = await response.text();
    const doc = new XMLParser({ ignoreAttributes: false }).parse(xml);
    const items = doc.rss.channel.item;
    expect(doc.rss.channel.title).toBe("Hashwire");
    expect(items.length).toBe(50);
    expect(items.every((i: { link: string }) => /^https:\/\//.test(i.link))).toBe(true);
    const theft = items.find((i: { title: string }) => i.title.includes("Crédit Mutuel"));
    expect(theft.description).toMatch(/Also reported by (CoinDesk, Decrypt|Decrypt, CoinDesk)\./);
    const bitcoin = items.find((i: { title: string }) => i.title.startsWith("Bitcoin rebounds"));
    expect(bitcoin.category).toContain("Bitcoin");
    vi.unstubAllEnvs();
  });
});
