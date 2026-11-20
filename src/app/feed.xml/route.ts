import { getWire } from "@/lib/load";
import { buildRss, rssResponse } from "@/lib/rss";
import { SITE_NAME, TAGLINE } from "@/lib/site";

/** Rebuilt at most every 15 minutes, the same rhythm as the source feeds. */
export const revalidate = 900;

/** Hashwire's own RSS feed: the latest 50 stories across every network. */
export async function GET() {
  const wire = await getWire();
  return rssResponse(
    buildRss({ title: SITE_NAME, description: TAGLINE, page: "/", self: "/feed.xml", clusters: wire.clusters, now: wire.now }),
  );
}
