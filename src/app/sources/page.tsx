import type { Metadata } from "next";
import Link from "next/link";

import { Frame } from "@/components/Frame";
import { getWire } from "@/lib/load";
import { breadcrumbLd, jsonLd, pageMeta } from "@/lib/site";
import { KIND_LABEL, SOURCES } from "@/lib/sources";
import { agoLong } from "@/lib/time";
import type { FeedResult, SourceKind } from "@/lib/types";

const description = `The ${SOURCES.length} crypto news feeds Hashwire reads every 15 minutes, from newsrooms, network teams, researchers and exchanges, and whether each one is working.`;

export const metadata: Metadata = {
  title: "Sources",
  description,
  ...pageMeta("/sources", "Hashwire sources", description),
};

const KINDS: SourceKind[] = ["press", "network", "research", "exchange"];

export default async function SourcesPage() {
  const wire = await getWire();
  return (
    <Frame sample={wire.sample}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([{ name: "Sources", path: "/sources" }])) }} />
      <div className="band band-short">
        <div className="band-inner">
          <h1>Sources</h1>
          <div className="band-intro">
            <p>The {SOURCES.length} feeds Hashwire reads, checked every 15 minutes. &ldquo;Full text&rdquo; means you can read their posts here.</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        {KINDS.map((kind) => (
          <section key={kind} className="source-group" aria-labelledby={`kind-${kind}`}>
            <h2 id={`kind-${kind}`}>{KIND_LABEL[kind]}</h2>
            <ul className="source-list">
              {SOURCES.filter((s) => s.kind === kind).map((source) => {
                const feed = wire.feeds.find((f) => f.slug === source.slug);
                const count = feed?.stories.length ?? 0;
                const readable = feed?.stories.filter((story) => story.read).length ?? 0;
                return (
                  <li key={source.slug}>
                    <h3>
                      <Link href={`/source/${source.slug}`}>{source.name}</Link>
                    </h3>
                    <p>{source.about}</p>
                    <p className="source-status">
                      <FeedStatus feed={feed} now={wire.now} readable={readable} count={count} />
                      <a href={source.homepage} rel="noopener">
                        Website<span className="visually-hidden"> of {source.name}</span>
                      </a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Frame>
  );
}

/** "30 stories · checked 12 minutes ago · full text", or what went wrong. */
function FeedStatus({ feed, now, count, readable }: { feed?: FeedResult; now: number; count: number; readable: number }) {
  if (!feed) return <span>Not checked yet</span>;
  if (feed.stale) {
    return (
      <span className="warn">
        Not responding ({feed.error}). Showing {count === 1 ? "1 story" : `${count} stories`} from {agoLong(feed.fetchedAt, now)}
      </span>
    );
  }
  if (!feed.ok) return <span className="warn">Not responding ({feed.error ?? "unknown error"})</span>;
  return (
    <span>
      {count === 1 ? "1 story" : `${count} stories`} · checked {agoLong(feed.fetchedAt, now)}
      {readable > 0 && " · full text"}
    </span>
  );
}
