import Link from "next/link";
import { notFound } from "next/navigation";

import { Frame } from "@/components/Frame";
import { Movers } from "@/components/Networks";
import { NewSince } from "@/components/NewSince";
import { Pager } from "@/components/Pager";
import { MostCovered } from "@/components/Rail";
import { Outage } from "@/components/Status";
import { StoryList } from "@/components/StoryList";
import { paginate } from "@/lib/paging";
import { SITE_NAME, absolute, breadcrumbLd, jsonLd } from "@/lib/site";
import type { Cluster, Wire } from "@/lib/types";

/** A filtered view of the wire: a network, a topic or a source. */
export function Section({
  wire,
  clusters,
  active,
  path,
  name,
  heading,
  title,
  intro,
  extra,
  parent,
  emptyText,
  page = 1,
}: {
  wire: Wire;
  clusters: Cluster[];
  active?: string;
  path: string;
  /** Short name for breadcrumbs and panels. */
  name: string;
  /** The page's h1, when it should differ from the name. */
  heading?: React.ReactNode;
  title: string;
  intro: React.ReactNode;
  extra?: React.ReactNode;
  /** A middle breadcrumb, such as Networks. */
  parent?: { name: string; path: string };
  emptyText: string;
  /** Which page of the list, from `?page=`. */
  page?: number;
}) {
  const paged = paginate(clusters, page);
  if (!paged) notFound();
  const crumbs = [...(parent ? [parent] : []), { name, path }];
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: absolute(path),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: clusters
          .slice(0, 10)
          .map((c, i) => ({ "@type": "ListItem", position: i + 1, url: c.lead.url, name: c.lead.title })),
      },
    },
    breadcrumbLd(crumbs),
  ];

  return (
    <Frame active={active} sample={wire.sample}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <div className="band band-short">
        <div className="band-inner">
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              <li>
                <Link href="/">All news</Link>
              </li>
              {parent && (
                <li>
                  <Link href={parent.path}>{parent.name}</Link>
                </li>
              )}
              <li aria-current="page">{name}</li>
            </ol>
          </nav>
          <h1>{heading ?? name}</h1>
          {extra}
          <div className="band-intro">{intro}</div>
          <p className="status">
            {clusters.length === 1 ? "1 story" : `${clusters.length} stories`} in the last three weeks.
          </p>
          {paged.page === 1 && <NewSince newest={clusters[0]?.latest ?? 0} />}
        </div>
      </div>
      <div className="columns">
        <div className="column-main">
          {wire.stories.length === 0 ? (
            <Outage />
          ) : (
            <>
              <StoryList clusters={paged.items} now={wire.now} empty={<p>{emptyText}</p>} />
              <Pager path={path} page={paged.page} pages={paged.pages} />
            </>
          )}
        </div>
        <aside className="column-side" aria-label="Most covered and price moves">
          <MostCovered clusters={clusters} now={wire.now} title={`Most covered: ${name}`} />
          <Movers prices={wire.prices} />
        </aside>
      </div>
    </Frame>
  );
}
