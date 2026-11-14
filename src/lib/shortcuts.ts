import { NETWORKS } from "./networks";
import { SOURCES } from "./sources";
import { TOPICS } from "./topics";

export interface Shortcut {
  href: string;
  label: string;
}

const norm = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

/**
 * Pages whose name is what the reader typed: searching "solana", "SOL", "defi" or "coindesk"
 * offers that network's, topic's or source's own page above the results. Exact names only, so
 * a search for a phrase never grows a row of loosely related links.
 */
export function shortcuts(query: string): Shortcut[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const found: Shortcut[] = [];
  for (const n of NETWORKS) {
    if ([n.name, n.slug, n.symbol ?? ""].some((name) => norm(name) === q)) {
      found.push({ href: `/network/${n.slug}`, label: `${n.name} news and price` });
    }
  }
  for (const t of TOPICS) {
    if ([t.name, t.slug, t.short ?? ""].some((name) => norm(name) === q)) {
      found.push({ href: `/topic/${t.slug}`, label: `${t.name} news` });
    }
  }
  for (const s of SOURCES) {
    if ([s.name, s.slug].some((name) => norm(name) === q)) {
      found.push({ href: `/source/${s.slug}`, label: `Everything from ${s.name}` });
    }
  }
  return found.slice(0, 4);
}
