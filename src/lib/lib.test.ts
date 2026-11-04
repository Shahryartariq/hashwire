import { describe, expect, it } from "vitest";

import { clusterStories, leadCluster, mostCovered } from "./cluster";
import { NETWORKS, networkBySlug, networksFor } from "./networks";
import { SAMPLE_NOW, sampleItems } from "./sample";
import { SOURCES, sourceBySlug } from "./sources";
import { MAX_AGE, PER_SOURCE, cleanSummary, toStories } from "./stories";
import { excerpt, hashId, plainText, safeUrl, tokens, urlKey } from "./text";
import { ago, agoLong, bucketize, formatDate } from "./time";
import { TOPICS, topicBySlug, topicsFor } from "./topics";
import type { RawItem, Source, Story } from "./types";

const HOUR = 3_600_000;
const NOW = Date.UTC(2026, 10, 4, 6);
const SOURCE_MAP = new Map(SOURCES.map((s) => [s.slug, s]));

const item = (overrides: Partial<RawItem> = {}): RawItem => ({
  title: "Bitcoin rallies as ETF inflows return",
  link: "https://example.com/a",
  date: NOW - HOUR,
  summary: "<p>A long enough summary about bitcoin prices moving higher as spot ETF inflows return this week.</p>",
  categories: [],
  ...overrides,
});

const testSource: Source = {
  slug: "test",
  name: "Test News",
  homepage: "https://example.com/",
  feed: "https://example.com/feed",
  kind: "press",
  about: "Test source.",
};

function allSampleStories(): Story[] {
  return SOURCES.flatMap((s) => toStories(s, sampleItems(s.slug), SAMPLE_NOW));
}

describe("text", () => {
  it("turns feed HTML into plain text, including double-encoded markup", () => {
    expect(plainText("<p>Hello &amp; <b>welcome</b></p>")).toBe("Hello & welcome");
    expect(plainText("&lt;p&gt;It&amp;#x27;s here&lt;/p&gt;")).toBe("It's here");
    expect(plainText("<script>alert(1)</script>Safe")).toBe("Safe");
    expect(plainText("Line<br>break\n\n  spaces")).toBe("Line break spaces");
    expect(plainText("")).toBe("");
  });

  it("shortens text at a word boundary", () => {
    expect(excerpt("short")).toBe("short");
    const long = "word ".repeat(80).trim();
    const cut = excerpt(long, 50);
    expect(cut.length).toBeLessThanOrEqual(50);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut).not.toMatch(/ …$/);
  });

  it("accepts only http(s) URLs and strips tracking parameters", () => {
    expect(safeUrl("https://a.example/x?utm_source=rss&id=2#top")).toBe("https://a.example/x?id=2");
    expect(safeUrl("/relative", "https://a.example/blog/")).toBe("https://a.example/relative");
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("https://user:pass@a.example/")).toBeNull();
    expect(safeUrl("not a url")).toBeNull();
    expect(safeUrl(undefined)).toBeNull();
  });

  it("gives the same key to the same article reached through different URLs", () => {
    expect(urlKey("https://www.a.example/post/")).toBe(urlKey("https://a.example/post"));
    expect(hashId("a")).toBe(hashId("a"));
    expect(hashId("a")).not.toBe(hashId("b"));
  });

  it("tokenizes headlines without stop words or plurals", () => {
    expect(tokens("OpenAI’s new Git backends are here")).toEqual(["openai", "git", "backend"]);
    expect(tokens("Llama.cpp and GPT-5.1")).toEqual(["llama.cpp", "gpt-5.1"]);
  });
});


describe("stories", () => {
  it("cleans titles and summaries, tags networks and topics, and keeps a link to the original", () => {
    const [story] = toStories(testSource, [item({ title: "Bitcoin &amp; Solana <b>rally</b>" })], NOW);
    expect(story.title).toBe("Bitcoin & Solana rally");
    expect(story.summary).toMatch(/^A long enough summary/);
    expect(story.url).toBe("https://example.com/a");
    expect(story.networks).toEqual(["bitcoin", "solana"]);
    expect(story.topics).toContain("markets");
  });

  it("drops items without a title, link or date, and items that are too old or far in the future", () => {
    const items = [
      item({ title: "" }),
      item({ link: "javascript:alert(1)" }),
      item({ date: null }),
      item({ link: "https://example.com/old", date: NOW - MAX_AGE - HOUR }),
      item({ link: "https://example.com/future", date: NOW + 48 * HOUR }),
      item({ link: "https://example.com/skew", date: NOW + HOUR }),
    ];
    const stories = toStories(testSource, items, NOW);
    expect(stories.map((s) => s.url)).toEqual(["https://example.com/skew"]);
    expect(stories[0].publishedAt).toBe(NOW);
  });

  it("removes duplicate URLs, sorts newest first and caps each source", () => {
    const many = Array.from({ length: PER_SOURCE + 10 }, (_, i) =>
      item({ link: `https://example.com/${i}`, date: NOW - i * HOUR }),
    );
    const stories = toStories(testSource, [...many, item({ link: "https://example.com/0?utm_medium=x" })], NOW);
    expect(stories).toHaveLength(PER_SOURCE);
    expect(stories[0].url).toBe("https://example.com/0");
    expect(new Set(stories.map((s) => s.id)).size).toBe(PER_SOURCE);
  });

  it("strips the boilerplate some feeds wrap around summaries", () => {
    expect(cleanSummary("Test News Big headline The real summary.", "Big headline", "Test News")).toBe("The real summary.");
    expect(cleanSummary("▶ Test News Video The talk.", "Video", "Test News")).toBe("The talk.");
    expect(cleanSummary("The real summary. Read the full story on CryptoSlate Understand more", "x", "y")).toBe("The real summary.");
    expect(cleanSummary("Text. The post Title appeared first on Site.", "x", "y")).toBe("Text.");

    const bm = toStories(sourceBySlug("bitcoin-magazine")!, sampleItems("bitcoin-magazine"), SAMPLE_NOW);
    expect(bm[0].summary).toBe("Tether CEO Paolo Ardoino said in Lugano that the company holds about 150,000 bitcoin.");
  });

  it("hides summaries that are captions, categories or boilerplate", () => {
    const short = toStories(testSource, [item({ summary: "Overview" })], NOW)[0];
    const category = toStories(testSource, [item({ summary: "Crypto Ecosystems and Companies", categories: ["Crypto Ecosystems and Companies"] })], NOW)[0];
    const off = toStories({ ...testSource, summaries: false }, [item()], NOW)[0];
    expect([short, category, off].every((s) => s.summary === undefined)).toBe(true);
  });

  it("applies each source's own filter", () => {
    const kraken = sourceBySlug("kraken")!;
    const listing = item({ title: "EURCV is available for trading!", categories: ["Asset Listings"] });
    const vip = item({ title: "Our VIP summer", link: "https://example.com/vip", categories: ["Kraken VIP"] });
    expect(toStories(kraken, [listing, vip], NOW).map((s) => s.title)).toEqual(["EURCV is available for trading!"]);

    const decrypt = sourceBySlug("decrypt")!;
    expect(toStories(decrypt, [item({ categories: ["Artificial Intelligence"] })], NOW)).toHaveLength(0);

    const block = sourceBySlug("the-block")!;
    expect(toStories(block, [item({ link: "https://www.theblock.co/learn/defi/x" })], NOW)).toHaveLength(0);
    expect(toStories(block, [item({ categories: ["campus"] })], NOW)).toHaveLength(0);

    const cointelegraph = sourceBySlug("cointelegraph")!;
    expect(toStories(cointelegraph, [item({ title: "Here’s what happened in crypto today" })], NOW)).toHaveLength(0);
  });

  it("tags every post from a network's own blog with that network", () => {
    const optech = toStories(sourceBySlug("bitcoin-optech")!, sampleItems("bitcoin-optech"), SAMPLE_NOW);
    expect(optech.every((s) => s.networks[0] === "bitcoin")).toBe(true);
    const base = toStories(sourceBySlug("base")!, sampleItems("base"), SAMPLE_NOW);
    expect(base.every((s) => s.networks[0] === "base")).toBe(true);
  });
});

describe("networks", () => {
  it("has unique slugs, a description and a valid colour for each network", () => {
    expect(NETWORKS.length).toBe(22);
    expect(new Set(NETWORKS.map((n) => n.slug)).size).toBe(NETWORKS.length);
    expect(new Set(NETWORKS.map((n) => n.coingecko).filter(Boolean)).size).toBe(NETWORKS.filter((n) => n.coingecko).length);
    for (const network of NETWORKS) {
      expect(network.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(network.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(network.about.length).toBeGreaterThan(40);
      expect(networkBySlug(network.slug)).toBe(network);
    }
  });

  it.each([
    ["Bitcoin surges to $78,300 in V-shaped comeback", ["bitcoin"]],
    ["Glamsterdam on Hoodi Postponed", ["ethereum"]],
    ["Binance hackers move 81% of stolen SOL", ["solana"]],
    ["Coinbase XRP looked cheap on Nov. 2", ["xrp-ledger"]],
    ["USDG deposits now available on Arbitrum One", ["arbitrum"]],
    ["How Shopify brought stablecoin payments to checkout on Base", ["base"]],
    ["Ava Labs ships a new Avalanche L1 toolkit", ["avalanche"]],
    ["Hyperliquid volume hits a record as HYPE rallies", ["hyperliquid"]],
    ["$LINK and $ETH lead the rebound", ["ethereum", "chainlink"]],
  ])("tags “%s”", (title, networks) => {
    expect(networksFor(title, "", [])).toEqual(networks);
  });

  it.each([
    "DOGE cuts government spending again",
    "A wave of optimism lifts markets",
    "An avalanche of liquidations hit traders",
    "Banks raise their base rates",
    "Polls show the race is near even",
    "Bitcoin's layer 2 race heats up",
  ])("doesn't read a network into “%s” by mistake", (title) => {
    const found = networksFor(title, "", []);
    expect(found.filter((n) => ["dogecoin", "optimism", "avalanche", "base", "near", "ethereum"].includes(n))).toEqual([]);
  });

  it("puts the source's own network first, then headline mentions, then the rest, at most four", () => {
    expect(networksFor("Sui vs Aptos", "Solana and Ethereum and Cardano", [], "sui")).toEqual(["sui", "aptos", "ethereum", "solana"]);
  });
});

describe("topics", () => {
  it("has unique slugs and a description for every topic", () => {
    expect(new Set(TOPICS.map((t) => t.slug)).size).toBe(TOPICS.length);
    for (const topic of TOPICS) {
      expect(topic.description.length).toBeGreaterThan(60);
      expect(topic.description.length).toBeLessThanOrEqual(160);
      expect(topicBySlug(topic.slug)).toBe(topic);
    }
    expect(topicBySlug("nope")).toBeUndefined();
  });

  it.each([
    ["Bitcoin bounces from 7-week low as liquidations near $300 million", "markets"],
    ["Bitcoin ETFs lose $1.16B as Bitwise calls selling short-term", "institutions"],
    ["SEC division views Canton Coin as digital commodity in no-action letter", "regulation"],
    ["Aave unlocks stock-backed loans with new lending markets", "defi"],
    ["Circle Payments Network reaches $41.3 billion in USDC volume", "stablecoins"],
    ["Binance says $6.34 billion hack began with fake job interview", "security"],
    ["EURCV is available for trading on Kraken", "exchanges"],
    ["Glamsterdam upgrade on the Hoodi testnet postponed", "development"],
  ] as const)("tags “%s” as %s", (title, topic) => {
    expect(topicsFor(title, "", [])).toContain(topic);
  });

  it("prefers headline matches and returns at most three topics", () => {
    const topics = topicsFor("A new stablecoin", "hack, lawsuit, ETF, staking and an upgrade", []);
    expect(topics[0]).toBe("stablecoins");
    expect(topics.length).toBeLessThanOrEqual(3);
    expect(topicsFor("A quiet day", "", [])).toEqual([]);
  });
});

describe("grouping", () => {
  const stories = allSampleStories();
  const clusters = clusterStories(stories, SOURCE_MAP);
  const groupOf = (title: string) => clusters.find((c) => c.stories.some((s) => s.title.startsWith(title)))!;

  it("puts reports of the same news together", () => {
    expect(groupOf("French bank Crédit Mutuel").sources.sort()).toEqual(["coindesk", "decrypt", "the-block"]);
    expect(groupOf("Morgan Stanley says").sources.sort()).toEqual(["coindesk", "the-block", "the-defiant"]);
    expect(groupOf("Justin Sun seeks").sources.sort()).toEqual(["cointelegraph", "cryptoslate", "decrypt"]);
    expect(groupOf("SEC division views Canton Coin").sources.sort()).toEqual(["cryptoslate", "the-block"]);
  });

  it("doesn't merge stories that only share common crypto words", () => {
    // "ruling party" and "SEC ruling" share a word, not a story.
    expect(groupOf("South Korea’s ruling party").stories).toHaveLength(1);
    expect(groupOf("New Jersey Drops Coinbase Staking Order").stories).toHaveLength(1);
    expect(groupOf("Bitcoin rebounds from midterm dip").stories).toHaveLength(1);
  });

  it("never groups two stories from one source", () => {
    for (const cluster of clusters) {
      expect(new Set(cluster.stories.map((s) => s.source)).size).toBe(cluster.stories.length);
    }
  });

  it("keeps every story exactly once, newest groups first, with the networks of every report", () => {
    expect(clusters.flatMap((c) => c.stories)).toHaveLength(stories.length);
    expect(clusters.map((c) => c.latest)).toEqual([...clusters.map((c) => c.latest)].sort((a, b) => b - a));
    const tether = groupOf("Tether Holds 150,000 Bitcoin");
    expect(tether.networks).toContain("bitcoin");
  });

  it("leads with the most covered recent story and ranks coverage", () => {
    expect(leadCluster(clusters, SAMPLE_NOW)?.lead.title).toMatch(/Crédit Mutuel/);
    const ranked = mostCovered(clusters, SAMPLE_NOW);
    expect(ranked.length).toBeGreaterThan(2);
    expect(ranked.every((c) => c.sources.length > 1)).toBe(true);
    expect(leadCluster([], SAMPLE_NOW)).toBeUndefined();
  });
});

describe("time", () => {
  it("formats compact and spoken ages", () => {
    expect(ago(NOW - 30_000, NOW)).toBe("now");
    expect(ago(NOW - 12 * 60_000, NOW)).toBe("12m");
    expect(ago(NOW - 3 * HOUR, NOW)).toBe("3h");
    expect(ago(NOW - 50 * HOUR, NOW)).toBe("2d");
    expect(ago(Date.UTC(2026, 9, 1), NOW)).toBe("Oct 1");
    expect(agoLong(NOW - HOUR, NOW)).toBe("1 hour ago");
    expect(agoLong(NOW - 3 * 60_000, NOW)).toBe("3 minutes ago");
    expect(formatDate(Date.UTC(2026, 10, 3, 14, 5))).toBe("3 Nov 2026, 14:05 UTC");
  });

  it("groups items by age and skips empty groups", () => {
    const times = [NOW - HOUR, NOW - 10 * HOUR, NOW - 30 * HOUR, NOW - 30 * 24 * HOUR];
    const groups = bucketize(times, (t) => t, NOW);
    expect(groups.map((g) => g.label)).toEqual(["Past 6 hours", "Earlier today", "Yesterday", "Older"]);
  });
});


describe("sources", () => {
  it("has unique slugs, https feeds and a description for each", () => {
    expect(new Set(SOURCES.map((s) => s.slug)).size).toBe(SOURCES.length);
    for (const source of SOURCES) {
      expect(source.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(source.feed.startsWith("https://")).toBe(true);
      expect(source.about.length).toBeGreaterThan(30);
      if (source.network) expect(networkBySlug(source.network), source.slug).toBeDefined();
    }
  });

  it("has sample data for every source", () => {
    for (const source of SOURCES) expect(sampleItems(source.slug).length, source.slug).toBeGreaterThan(0);
  });
});
