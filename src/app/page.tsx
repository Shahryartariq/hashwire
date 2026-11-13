import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Frame } from "@/components/Frame";
import { Lead } from "@/components/Lead";
import { Movers, NetworkStrip } from "@/components/Networks";
import { NewSince } from "@/components/NewSince";
import { Pager } from "@/components/Pager";
import { MostCovered } from "@/components/Rail";
import { Outage, Status } from "@/components/Status";
import { StoryList } from "@/components/StoryList";
import { leadCluster } from "@/lib/cluster";
import { getWire } from "@/lib/load";
import { pageHref, paginate, pagedRobots, pagedTitle, readPage } from "@/lib/paging";
import { SITE_DESCRIPTION, SITE_NAME, absolute, jsonLd, pageMeta } from "@/lib/site";

const TITLE = `${SITE_NAME}: crypto and blockchain news, network by network`;

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const page = readPage((await searchParams).page) ?? 1;
  return {
    title: { absolute: pagedTitle(TITLE, page) },
    description: SITE_DESCRIPTION,
    ...pageMeta(pageHref("/", page), `${SITE_NAME}: crypto news by blockchain`, SITE_DESCRIPTION),
    ...pagedRobots(page),
  };
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const requested = readPage((await searchParams).page);
  if (requested === null) notFound();
  const wire = await getWire();
  const lead = leadCluster(wire.clusters, wire.now);
  const paged = paginate(
    wire.clusters.filter((c) => c.id !== lead?.id),
    requested,
  );
  if (!paged) notFound();
  const first = paged.page === 1;

  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: absolute("/"),
      description: SITE_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${absolute("/search")}?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Latest crypto news",
      itemListElement: [lead, ...paged.items]
        .filter((c) => c !== undefined)
        .slice(0, 10)
        .map((c, i) => ({ "@type": "ListItem", position: i + 1, url: c.lead.url, name: c.lead.title })),
    },
  ];

  return (
    <Frame active="home" sample={wire.sample}>
      {first && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />}
      <div className={first ? "band" : "band band-short"}>
        {first && wire.prices.ok && <NetworkStrip prices={wire.prices} />}
        <div className="band-inner">
          <div className="band-heading">
            <h1>{first ? "Crypto news today" : "Earlier crypto news"}</h1>
            <Status wire={wire} />
            {first && <NewSince newest={wire.clusters[0]?.latest ?? 0} />}
          </div>
          {first && lead && <Lead cluster={lead} now={wire.now} />}
        </div>
      </div>
      <div className="columns">
        <div className="column-main">
          {wire.stories.length === 0 ? (
            <Outage />
          ) : (
            <>
              <StoryList clusters={paged.items} now={wire.now} empty={<p>No other stories yet.</p>} />
              <Pager path="/" page={paged.page} pages={paged.pages} />
            </>
          )}
        </div>
        <aside className="column-side" aria-label="Most covered and price moves">
          <MostCovered clusters={wire.clusters} now={wire.now} />
          <Movers prices={wire.prices} />
        </aside>
      </div>
    </Frame>
  );
}
