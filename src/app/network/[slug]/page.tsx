import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Change, Dot } from "@/components/Networks";
import { Section } from "@/components/Section";
import { getWire, inNetwork } from "@/lib/load";
import { networkBySlug } from "@/lib/networks";
import { formatCap, formatUsd } from "@/lib/prices";
import { pageMeta } from "@/lib/site";
import { SOURCES } from "@/lib/sources";
import { agoLong } from "@/lib/time";

function copy(slug: string) {
  const network = networkBySlug(slug);
  if (!network) return undefined;
  const title = `${network.name}${network.symbol ? ` (${network.symbol})` : ""} news and price today`;
  const description = `Latest ${network.name} news from crypto newsrooms${
    SOURCES.some((s) => s.network === slug) ? ` and the ${network.name} team` : ""
  }, with the ${network.symbol ?? network.name} price and 24-hour change. Updated every 15 minutes.`;
  return { network, title, description };
}

export async function generateMetadata({ params }: PageProps<"/network/[slug]">): Promise<Metadata> {
  const page = copy((await params).slug);
  if (!page) return {};
  const path = `/network/${page.network.slug}`;
  return {
    title: page.title,
    description: page.description,
    ...pageMeta(path, page.title, page.description, `${path}/opengraph-image`),
  };
}

export default async function NetworkPage({ params }: PageProps<"/network/[slug]">) {
  const page = copy((await params).slug);
  if (!page) notFound();
  const { network } = page;
  const wire = await getWire();
  const price = wire.prices.byNetwork[network.slug];
  const official = SOURCES.filter((s) => s.network === network.slug);

  return (
    <Section
      wire={wire}
      clusters={wire.clusters.filter((c) => inNetwork(c, network.slug))}
      active="networks"
      path={`/network/${network.slug}`}
      parent={{ name: "Networks", path: "/networks" }}
      name={network.name}
      heading={
        <span className="network-heading">
          <Dot slug={network.slug} />
          {network.name}
          {network.symbol && <span className="symbol">{network.symbol}</span>}
        </span>
      }
      title={page.title}
      extra={
        price ? (
          <dl className="price-block">
            <div>
              <dt>Price</dt>
              <dd className="price-big">{formatUsd(price.usd)}</dd>
            </div>
            <div>
              <dt>24 hours</dt>
              <dd>
                <Change change={price.change24h} />
              </dd>
            </div>
            {price.marketCap && (
              <div>
                <dt>Market cap</dt>
                <dd>{formatCap(price.marketCap)}</dd>
              </div>
            )}
            <div className="price-source">
              <dt className="visually-hidden">Source</dt>
              <dd>
                CoinGecko, {agoLong(price.updatedAt, wire.now)}. Not investment advice.
              </dd>
            </div>
          </dl>
        ) : network.symbol ? (
          <p className="band-links">The price didn&apos;t load just now.</p>
        ) : null
      }
      intro={
        <>
          <p>{network.about}</p>
          <p className="band-links">
            <a href={network.homepage} rel="noopener">
              {new URL(network.homepage).hostname.replace(/^www\./, "")}
            </a>
            {official.map((source) => (
              <a key={source.slug} href={`/source/${source.slug}`}>
                Official posts: {source.name}
              </a>
            ))}
          </p>
        </>
      }
      emptyText={`No ${network.name} stories in the last three weeks.`}
    />
  );
}
