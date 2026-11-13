import type { Metadata } from "next";
import Link from "next/link";

import { Frame } from "@/components/Frame";
import { StoryList } from "@/components/StoryList";
import { getWire, search } from "@/lib/load";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the last three weeks of crypto news on Hashwire.",
  // Result pages are endless near-duplicates; let search engines follow the links instead.
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

/** Results shown at once; a longer list is better narrowed with another word. */
const MAX_RESULTS = 50;

function readQuery(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 80);
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = readQuery((await searchParams).q);
  const wire = await getWire();
  const results = query ? search(wire.clusters, query) : [];
  const shown = results.slice(0, MAX_RESULTS);
  return (
    <Frame query={query} sample={wire.sample}>
      <div className="band band-short">
        <div className="band-inner">
          <h1>{query ? `Results for “${query}”` : "Search"}</h1>
          <p className="status" role="status">
            {!query
              ? "Search headlines and summaries from the last three weeks."
              : results.length === 1
                ? "1 story found."
                : results.length > MAX_RESULTS
                  ? `${results.length} stories found. Showing the newest ${MAX_RESULTS}; add a word to narrow it down.`
                  : `${results.length} stories found.`}
          </p>
        </div>
      </div>
      <div className="page-body">
        <StoryList
          clusters={shown}
          now={wire.now}
          empty={
            query ? (
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
      </div>
    </Frame>
  );
}
