import Link from "next/link";

import { pageHref } from "@/lib/paging";

/** "Newer stories / Page 2 of 4 / Older stories" under a list. Nothing when there's one page. */
export function Pager({ path, page, pages }: { path: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  return (
    <nav className="pager" aria-label="More stories">
      {page > 1 ? (
        <Link href={pageHref(path, page - 1)} rel="prev" className="pager-link">
          <span aria-hidden="true">← </span>Newer stories
        </Link>
      ) : (
        <span />
      )}
      <span className="pager-count">
        Page {page} of {pages}
      </span>
      {page < pages ? (
        <Link href={pageHref(path, page + 1)} rel="next" className="pager-link">
          Older stories<span aria-hidden="true"> →</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
