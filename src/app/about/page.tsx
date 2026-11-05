import type { Metadata } from "next";
import Link from "next/link";

import { Coverage } from "@/components/Coverage";
import { Frame } from "@/components/Frame";
import { NETWORKS } from "@/lib/networks";
import { SOURCE_URL, pageMeta } from "@/lib/site";
import { SOURCES } from "@/lib/sources";
import { TOPICS } from "@/lib/topics";

const description =
  "What Hashwire is, where its crypto news and prices come from, how stories are tagged by network and grouped, and how to get a story corrected or removed.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...pageMeta("/about", "About Hashwire", description),
};

export default function AboutPage() {
  return (
    <Frame>
      <div className="band band-short">
        <div className="band-inner">
          <h1>About Hashwire</h1>
          <div className="band-intro">
            <p>Crypto news sorted by blockchain, so you can follow the networks you care about without the noise.</p>
          </div>
        </div>
      </div>
      <div className="page-body prose">
        <h2>Where the news comes from</h2>
        <p>
          Hashwire reads the public RSS feeds of {SOURCES.length} <Link href="/sources">sources</Link> every 15 minutes:
          newsrooms such as CoinDesk, The Block, DL News and Unchained, the networks&apos; own teams such as the Ethereum
          Foundation, Bitcoin Core and Solana, research and security teams such as Chainalysis, Glassnode and the Ethereum
          research forums, and exchanges such as Kraken.
        </p>
        <p>
          For each story you see the headline, a short excerpt when the feed provides one, the source and the time. The
          headline links to the original article. When a publisher&apos;s own feed carries the whole post, you can also read
          it here in the reader view, always with a link to the original. Hashwire never copies articles from
          publishers&apos; websites.
        </p>

        <h2>Networks</h2>
        <p>
          Every story is tagged with the blockchains it&apos;s about, from its headline, summary and the feed&apos;s own
          categories. Each of the {NETWORKS.length} <Link href="/networks">networks</Link> has its own page with only its
          news. Posts from a network&apos;s own team are always tagged with that network.
        </p>
        <p>
          Some names are ordinary words, so they count only in phrases that can&apos;t mean anything else: “Base” in
          “on Base” or “Base app”, “Avalanche” in “Avalanche network”, “Optimism” in “OP Mainnet”. “DOGE” alone isn&apos;t
          counted, because it&apos;s also a US government department.
        </p>

        <h2>Prices</h2>
        <p>
          Prices, 24-hour changes and market caps come from{" "}
          <a href="https://www.coingecko.com/" rel="noopener">
            CoinGecko
          </a>{" "}
          and are refreshed every 10 minutes. They&apos;re for orientation, not trading decisions. Nothing on Hashwire is
          investment advice.
        </p>

        <h2>How stories are grouped</h2>
        <p>
          When several sources report the same news, it appears once. A network team&apos;s own post leads when there is
          one; otherwise the first report does. The other coverage is listed under it, and the cells show how many
          sources picked it up:
        </p>
        <ul className="legend">
          <li>
            <Coverage count={1} /> one source
          </li>
          <li>
            <Coverage count={3} /> three sources
          </li>
        </ul>
        <p>
          Grouping is automatic: two stories go together when their headlines share most of their words, or when they
          share several words no other story uses. It sometimes misses a match; it rarely makes a wrong one.
        </p>

        <h2>Labels</h2>
        <p>
          <span className="official">Official</span> marks a post from a network&apos;s own team. Topics (
          {TOPICS.map((t) => t.name.toLowerCase()).join(", ")}) come from keyword rules on the headline and summary.
        </p>

        <h2>Privacy</h2>
        <p>
          There are no accounts and no cookies of its own. To mark new stories, your browser remembers the time of the
          newest story you saw; it stays on your device. If analytics is switched on, visits are counted with Google
          Analytics.
        </p>

        <h2>Corrections and removal</h2>
        <p>
          If you publish one of these feeds and want it removed, or a story is tagged or grouped wrongly, please{" "}
          <a href={`${SOURCE_URL}/issues`} rel="noopener">
            open an issue on GitHub
          </a>
          .
        </p>

        <h2>Who made this</h2>
        <p>
          Hashwire is built by{" "}
          <a href="https://github.com/Shahryartariq" rel="noopener">
            Muhammad Shehryar
          </a>
          , a full-stack developer, with Next.js and TypeScript. It&apos;s the sister site of{" "}
          <a href="https://tensorwire.vercel.app" rel="noopener">
            Tensorwire
          </a>{" "}
          for AI news. The <a href={SOURCE_URL}>source code</a> is open.
        </p>
      </div>
    </Frame>
  );
}
