import { networkName } from "./networks";
import { absolute } from "./site";
import { sourceName } from "./sources";
import { topicBySlug } from "./topics";
import type { Cluster } from "./types";

/** Stories in a feed. */
export const RSS_ITEMS = 50;

export function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

/**
 * An RSS 2.0 document: the latest stories, each once, with the other coverage named.
 * `page` is the page on Hashwire the feed belongs to, `self` the feed's own address.
 */
export function buildRss({
  title,
  description,
  page,
  self,
  clusters,
  now,
}: {
  title: string;
  description: string;
  page: string;
  self: string;
  clusters: Cluster[];
  now: number;
}): string {
  const items = clusters.slice(0, RSS_ITEMS).map((cluster) => {
    const { lead } = cluster;
    const others = cluster.sources.slice(1).map(sourceName);
    const text = [lead.summary, others.length ? `Also reported by ${others.join(", ")}.` : ""].filter(Boolean).join(" ");
    return [
      "<item>",
      `<title>${escapeXml(lead.title)}</title>`,
      `<link>${escapeXml(lead.url)}</link>`,
      `<guid isPermaLink="false">hashwire-${lead.id}</guid>`,
      `<pubDate>${new Date(cluster.latest).toUTCString()}</pubDate>`,
      `<source url="${escapeXml(absolute(`/source/${lead.source}`))}">${escapeXml(sourceName(lead.source))}</source>`,
      ...cluster.networks.map((n) => `<category>${escapeXml(networkName(n))}</category>`),
      ...cluster.topics.map((t) => `<category>${escapeXml(topicBySlug(t)?.name ?? t)}</category>`),
      text ? `<description>${escapeXml(text)}</description>` : "",
      "</item>",
    ].join("");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(title)}</title>`,
    `<link>${escapeXml(absolute(page))}</link>`,
    `<description>${escapeXml(description)}</description>`,
    "<language>en</language>",
    `<lastBuildDate>${new Date(now).toUTCString()}</lastBuildDate>`,
    `<atom:link href="${escapeXml(absolute(self))}" rel="self" type="application/rss+xml"/>`,
    "<ttl>15</ttl>",
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");
}

/** The response for a feed: cached at the edge for 15 minutes, the rhythm of the source feeds. */
export function rssResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
