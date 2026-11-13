/** Stories per page on the front page and the network, topic and source pages. */
export const PAGE_SIZE = 30;

/**
 * The page number from `?page=`. No parameter means page 1; anything that isn't a whole number
 * from 1 up is null, and the page answers 404.
 */
export function readPage(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) return 1;
  if (!/^[1-9]\d{0,3}$/.test(raw)) return null;
  return Number(raw);
}

export interface Paged<T> {
  items: T[];
  page: number;
  pages: number;
}

/** One page of items, or null when the page is past the end. Page 1 always exists, even if empty. */
export function paginate<T>(items: readonly T[], page: number, size = PAGE_SIZE): Paged<T> | null {
  const pages = Math.max(1, Math.ceil(items.length / size));
  if (page > pages) return null;
  return { items: items.slice((page - 1) * size, page * size), page, pages };
}

/** The address of page `page` of `path`: page 1 has no parameter. */
export function pageHref(path: string, page: number): string {
  return page <= 1 ? path : `${path}?page=${page}`;
}

/**
 * Page 2 and later stay out of search results (their stories were on page 1 days earlier), but
 * search engines still follow their links.
 */
export function pagedRobots(page: number) {
  return page > 1 ? { robots: { index: false, follow: true } } : {};
}

/** "Bitcoin news · page 2" for page 2 and later. */
export function pagedTitle(title: string, page: number): string {
  return page > 1 ? `${title} · page ${page}` : title;
}
