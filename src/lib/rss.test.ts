import { describe, expect, it } from "vitest";

import { buildRss, escapeXml } from "./rss";
import type { Cluster } from "./types";

describe("RSS", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;");
  });

  it("builds a feed with a self link and one item per cluster", () => {
    const story = { id: "abc", source: "coindesk", title: "BTC <up>", url: "https://example.com/a?x=1&y=2", publishedAt: 0, topics: [], networks: ["bitcoin"] };
    const cluster = { id: "abc", lead: story, stories: [story], sources: ["coindesk"], latest: 0, networks: ["bitcoin"], topics: [] } as unknown as Cluster;
    const xml = buildRss({ title: "Bitcoin news", description: "d", page: "/network/bitcoin", self: "/network/bitcoin/feed.xml", clusters: [cluster], now: 0 });
    expect(xml).toContain('<atom:link href="');
    expect(xml).toContain("/network/bitcoin/feed.xml");
    expect(xml).toContain("<title>BTC &lt;up&gt;</title>");
    expect(xml).toContain("<link>https://example.com/a?x=1&amp;y=2</link>");
    expect(xml).toContain("<category>Bitcoin</category>");
    expect(xml.match(/<item>/g)).toHaveLength(1);
  });
});
