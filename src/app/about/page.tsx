import type { Metadata } from "next";
import Link from "next/link";

import { Frame } from "@/components/Frame";
import { NETWORKS } from "@/lib/networks";
import { SITE_NAME, SOURCE_URL, absolute, breadcrumbLd, jsonLd, pageMeta } from "@/lib/site";
import { SOURCES } from "@/lib/sources";

const description =
  "Where Hashwire's crypto news and prices come from, how stories are sorted by network, and how to get a story corrected or removed.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...pageMeta("/about", "About Hashwire", description),
};

export default function AboutPage() {
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Hashwire",
      url: absolute("/about"),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") },
    },
    breadcrumbLd([{ name: "About", path: "/about" }]),
  ];
  return (
    <Frame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <div className="band band-short">
        <div className="band-inner">
          <h1>About Hashwire</h1>
          <div className="band-intro">
            <p>Crypto news sorted by blockchain, so you can follow the networks you care about.</p>
          </div>
        </div>
      </div>
      <div className="page-body prose">
        <h2>Where the news comes from</h2>
        <p>
          Hashwire reads the public feeds of {SOURCES.length} <Link href="/sources">sources</Link> every 15 minutes:
          newsrooms like CoinDesk and The Block, network teams like the Ethereum Foundation and Bitcoin Core, researchers like
          Chainalysis, and exchanges like Kraken.
        </p>
        <p>
          Each story shows its headline, a short summary and a link to the original article. When a feed includes the full
          post, you can also read it here without ads or pop-ups. Hashwire never copies articles from publishers&apos;
          websites.
        </p>

        <h2>Networks</h2>
        <p>
          Stories are tagged with the blockchains they mention, and each of the {NETWORKS.length}{" "}
          <Link href="/networks">networks</Link> has a page with only its news. Posts from a network&apos;s own team are
          marked <span className="official">Official</span>.
        </p>

        <h2>Duplicate stories</h2>
        <p>
          When several outlets report the same news, it appears once, with the other reports listed under it. Matching is
          automatic, so it sometimes misses a pair.
        </p>

        <h2>Prices</h2>
        <p>
          Prices come from <a href="https://www.coingecko.com/" rel="noopener">CoinGecko</a> and refresh every 10 minutes. Nothing on
          Hashwire is investment advice.
        </p>

        <h2>Privacy</h2>
        <p>
          No accounts and no cookies. To mark new stories, your browser remembers the time of the newest story you saw, on
          your device only. If analytics is on, visits are counted with Google Analytics.
        </p>

        <h2>Corrections and removal</h2>
        <p>
          If you publish one of these feeds and want it removed, or a story is tagged wrongly,{" "}
          <a href={`${SOURCE_URL}/issues`} rel="noopener">open an issue on GitHub</a>.
        </p>

        <h2>Who made this</h2>
        <p>
          Built by <a href="https://github.com/Shahryartariq" rel="noopener">Muhammad Shehryar</a> with Next.js and TypeScript. The{" "}
          <a href={SOURCE_URL}>source code</a> is open. For AI news, see the sister site{" "}
          <a href="https://tensorwire.vercel.app" rel="noopener">Tensorwire</a>.
        </p>
      </div>
    </Frame>
  );
}
