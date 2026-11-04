import { networksFor } from "./networks";
import { readingMinutes } from "./reader";
import { excerpt, hashId, plainText, safeUrl, urlKey } from "./text";
import { topicsFor } from "./topics";
import type { RawItem, Source, Story } from "./types";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Stories older than this drop off the site. */
export const MAX_AGE = 21 * DAY;
/** At most this many stories per source, newest first. */
export const PER_SOURCE = 30;

const TRAILERS = [
  /\s*Read the full story on [^.]*\.?.*$/i,
  /\s*The post .{1,300}? appeared first on .*$/i,
  /\s*Continue reading on .*$/i,
];

/**
 * Removes what some feeds wrap around the real summary: the publication name and headline
 * repeated at the start, a play symbol for videos, "Read the full story on…" at the end.
 */
export function cleanSummary(text: string, title: string, sourceName: string): string {
  let out = text.replace(/^[▶►⏵]\s*/u, "");
  if (out.startsWith(`${sourceName} `)) out = out.slice(sourceName.length + 1);
  if (out.startsWith(title)) out = out.slice(title.length);
  for (const trailer of TRAILERS) out = out.replace(trailer, "");
  return out.trim();
}

function usefulSummary(summary: string, title: string, categories: string[]): boolean {
  if (summary.length < 40) return false;
  const lower = summary.toLowerCase();
  if (lower === title.toLowerCase()) return false;
  if (categories.some((c) => c.toLowerCase() === lower)) return false;
  return !/^(article url:|comments url:)/i.test(summary);
}

/** Clean, filter and label one source's items. Pure: `now` is passed in so tests are repeatable. */
export function toStories(source: Source, items: RawItem[], now: number): Story[] {
  const stories: Story[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const title = plainText(item.title);
    const url = safeUrl(item.link, source.homepage);
    if (!title || !url || item.date === null) continue;

    // A date slightly in the future is clock skew; much later is a mistake in the feed.
    if (item.date > now + 6 * HOUR) continue;
    const publishedAt = Math.min(item.date, now);
    if (now - publishedAt > MAX_AGE) continue;

    const text = cleanSummary(plainText(item.summary), title, source.name);
    const categories = item.categories.map(plainText).filter(Boolean);
    if (source.include && !source.include({ title, text, categories, url })) continue;

    const key = urlKey(url);
    if (seen.has(key)) continue;
    seen.add(key);

    const summary = source.summaries !== false && usefulSummary(text, title, categories) ? excerpt(text) : undefined;
    const discussion = safeUrl(item.comments) ?? undefined;
    const read = readingMinutes(item.body);
    const body = source.summaries === false ? "" : text;

    stories.push({
      id: hashId(key),
      source: source.slug,
      title,
      url,
      publishedAt,
      ...(summary ? { summary } : {}),
      topics: topicsFor(title, body, categories),
      networks: networksFor(title, body, categories, source.network),
      ...(discussion && discussion !== url ? { discussion } : {}),
      ...(read ? { read } : {}),
    });
  }

  return stories.sort((a, b) => b.publishedAt - a.publishedAt).slice(0, PER_SOURCE);
}
