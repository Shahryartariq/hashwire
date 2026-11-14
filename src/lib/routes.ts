import { NETWORKS, networkBySlug } from "./networks";
import { sourceBySlug } from "./sources";
import { topicBySlug } from "./topics";

export type SectionKind = "network" | "topic" | "source";

const BY_SYMBOL = new Map(NETWORKS.filter((n) => n.symbol).map((n) => [n.symbol!.toLowerCase(), n.slug]));

/**
 * The slug a section address really means, or null when there's no such page. Addresses are
 * forgiving about case ("/network/Bitcoin") and networks also answer to their ticker
 * ("/network/btc"); the caller redirects when the result differs from what was asked for.
 * `raw` is the path segment as it arrived, still percent-encoded.
 */
export function resolveSection(kind: SectionKind, raw: string): string | null {
  let slug: string;
  try {
    slug = decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    // Malformed percent-encoding ("%E0%A4%A") is nobody's page.
    return null;
  }
  if (kind === "network") return networkBySlug(slug)?.slug ?? BY_SYMBOL.get(slug) ?? null;
  if (kind === "topic") return topicBySlug(slug)?.slug ?? null;
  return sourceBySlug(slug)?.slug ?? null;
}
