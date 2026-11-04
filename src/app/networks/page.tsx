import type { Metadata } from "next";

import { Frame } from "@/components/Frame";
import { NetworkTable } from "@/components/Networks";
import { getWire } from "@/lib/load";
import { NETWORKS } from "@/lib/networks";
import { byMarketCap } from "@/lib/prices";
import { SITE_NAME, absolute, jsonLd, pageMeta } from "@/lib/site";

const title = "Blockchain networks: news and prices";
const description = `News and prices for ${NETWORKS.length} blockchain networks, from Bitcoin, Ethereum and Solana to layer 2s like Arbitrum and Base. Pick a network to read only its news.`;

export const metadata: Metadata = {
  title,
  description,
  ...pageMeta("/networks", title, description),
};

export default async function NetworksPage() {
  const wire = await getWire();
  const structured = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: absolute("/networks"),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: byMarketCap(wire.prices.byNetwork).map((n, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(`/network/${n.slug}`),
        name: `${n.name} news`,
      })),
    },
  };
  return (
    <Frame active="networks" sample={wire.sample}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <div className="band band-short">
        <div className="band-inner">
          <h1>Networks</h1>
          <div className="band-intro">
            <p>
              Every story on Hashwire is tagged with the blockchains it&apos;s about. Pick a network to read only its news,
              with its price, its own team&apos;s posts and the coverage from crypto newsrooms.
            </p>
          </div>
        </div>
      </div>
      <div className="page-body">
        {!wire.prices.ok && <p className="note">Prices didn&apos;t load just now; the news still works.</p>}
        <NetworkTable prices={wire.prices} clusters={wire.clusters} now={wire.now} />
        <p className="table-note">
          Sorted by market cap. Prices by CoinGecko, refreshed every 10 minutes. Not investment advice.
        </p>
      </div>
    </Frame>
  );
}
