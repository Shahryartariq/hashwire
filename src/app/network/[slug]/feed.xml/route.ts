import { getWire, inNetwork } from "@/lib/load";
import { networkBySlug } from "@/lib/networks";
import { buildRss, rssResponse } from "@/lib/rss";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 900;

/** One network's news as RSS, for following Bitcoin or Solana alone in a feed reader. */
export async function GET(_request: Request, { params }: RouteContext<"/network/[slug]/feed.xml">) {
  const network = networkBySlug((await params).slug);
  if (!network) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const wire = await getWire();
  const path = `/network/${network.slug}`;
  return rssResponse(
    buildRss({
      title: `${network.name} news · ${SITE_NAME}`,
      description: `The latest ${network.name} news from crypto newsrooms and the network's own team.`,
      page: path,
      self: `${path}/feed.xml`,
      clusters: wire.clusters.filter((c) => inNetwork(c, network.slug)),
      now: wire.now,
    }),
  );
}
