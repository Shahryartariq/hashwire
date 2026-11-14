import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Frame } from "@/components/Frame";
import { Pager } from "@/components/Pager";
import { StoryList } from "@/components/StoryList";
import { getWire, search } from "@/lib/load";
import { paginate, readPage } from "@/lib/paging";
import { shortcuts } from "@/lib/shortcuts";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the last three weeks of crypto news on Hashwire.",
  // Result pages are endless near-duplicates; let search engines follow the links instead.
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 80);
}

/** The search only matches words of two characters or more. */
function tooShort(query: string): boolean {
  return query.split(/\s+/).every((word) => word.replace(/[^\p{L}\p{N}]/gu, "").length < 2);
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = readQuery(params.q);
  const page = readPage(params.page);
  if (page === null) notFound();
  const wire = await getWire();
  const short = query !== "" && tooShort(query);
  const results = query && !short ? search(wire.clusters, query) : [];
  const paged = paginate(results, page);
  if (!paged) notFound();
  const links = shortcuts(query);
  return (
    <Frame query={query} sample={wire.sample}>
      <div className="band band-short">
        <div className="band-inner">
          <h1>{query ? `Results for “${query}”` : "Search"}</h1>
          <p className="status" role="status">
            {!query
              ? "Search headlines and summaries from the last three weeks."
              : short
                ? "Type at least two letters or numbers to search."
                : results.length === 1
                  ? "1 story found."
                  : `${results.length} stories found.`}
          </p>
        </div>
      </div>
      <div className="page-body">
        {links.length > 0 && (
          <nav className="shortcuts" aria-label="Go straight to">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="button button-quiet">
                {link.label}
                <span aria-hidden="true"> →</span>
              </Link>
            ))}
          </nav>
        )}
        <StoryList
          clusters={paged.items}
          now={wire.now}
          empty={
            short ? (
              <p>Try a longer word, like “ETF”, “Binance” or “staking”.</p>
            ) : query ? (
              <>
                <p>Nothing matches every word of “{query}”. Try fewer words, or browse a topic:</p>
                <ul className="inline-links">
                  {TOPICS.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topic/${t.slug}`}>{t.name}</Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Try a coin, a company or a word like “ETF”, “Binance” or “staking”.</p>
            )
          }
        />
        <Pager path={`/search?q=${encodeURIComponent(query)}`} page={paged.page} pages={paged.pages} />
      </div>
    </Frame>
  );
}
