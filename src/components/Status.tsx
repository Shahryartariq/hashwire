import Link from "next/link";

import { SOURCES } from "@/lib/sources";
import { agoLong } from "@/lib/time";
import type { Wire } from "@/lib/types";

/** "Newest story 12 minutes ago · 38 sources". Says so when some sources aren't responding. */
export function Status({ wire }: { wire: Wire }) {
  const working = wire.feeds.filter((f) => f.ok).length;
  const newest = wire.stories[0]?.publishedAt;
  return (
    <p className="status">
      {newest && <>Newest story {agoLong(newest, wire.now)} · </>}
      <Link href="/sources">
        {working === SOURCES.length ? `${SOURCES.length} sources` : `${working} of ${SOURCES.length} sources responding`}
      </Link>
    </p>
  );
}

/** Shown in place of the wire when no feed could be read at all. */
export function Outage() {
  return (
    <div className="notice">
      <h2>The feeds didn&apos;t load</h2>
      <p>None of the news sources answered just now. Try again in a minute.</p>
    </div>
  );
}
