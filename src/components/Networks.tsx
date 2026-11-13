import { NETWORKS, networkBySlug } from "@/lib/networks";
import { byMarketCap, changeInWords, direction, formatCap, formatChange, formatUsd } from "@/lib/prices";
import type { Cluster, Price, Prices } from "@/lib/types";

/**
 * The network's brand colour as a small square. Decoration only: the name carries the meaning.
 * Drawn as SVG with a fill attribute because the Content Security Policy blocks inline styles.
 */
export function Dot({ slug }: { slug: string }) {
  const color = networkBySlug(slug)?.color ?? "currentColor";
  return (
    <svg className="dot" viewBox="0 0 10 10" aria-hidden="true">
      <rect x="0.5" y="0.5" width="9" height="9" rx="2" fill={color} />
    </svg>
  );
}

/** A link to a network's page, used on every story. */
export function NetworkChip({ slug }: { slug: string }) {
  const network = networkBySlug(slug);
  if (!network) return null;
  return (
    <a href={`/network/${slug}`} className="chip">
      <Dot slug={slug} />
      {network.name}
    </a>
  );
}

/** "+1.7%" in green with ▲, "−1.0%" in red with ▼. The arrow and sign carry the meaning, not just the colour. */
export function Change({ change }: { change: number | null }) {
  if (change === null) return null;
  const dir = direction(change);
  const arrow = dir === "up" ? "▲" : dir === "down" ? "▼" : "";
  return (
    <span className={`change change-${dir}`}>
      <span aria-hidden="true">
        {arrow && <span className="arrow">{arrow}</span>}
        {formatChange(change)}
      </span>
      <span className="visually-hidden">{changeInWords(change)}</span>
    </span>
  );
}

/** Price and 24-hour change on one line. */
export function Quote({ price }: { price?: Price }) {
  if (!price) return <span className="quote quote-none">No token price</span>;
  return (
    <span className="quote">
      <span className="price">{formatUsd(price.usd)}</span>
      <Change change={price.change24h} />
    </span>
  );
}

/*
 * Network links are plain anchors rather than next/link: the front page holds dozens of them,
 * and client-side links add hydration and prefetch work for little gain on a news page.
 */

/**
 * The networks across the front page: the largest by market cap, each with its price and
 * 24-hour change, each a link to its own page. This is how readers move from the general
 * wire to one chain's news.
 */
export function NetworkStrip({ prices, limit = 12 }: { prices: Prices; limit?: number }) {
  const list = byMarketCap(prices.byNetwork).slice(0, limit);
  return (
    <nav className="strip" aria-label="Networks">
      <ul>
        {list.map((network) => (
          <li key={network.slug}>
            <a href={`/network/${network.slug}`}>
              <span className="strip-name">
                <Dot slug={network.slug} />
                {network.name}
              </span>
              <Quote price={prices.byNetwork[network.slug]} />
            </a>
          </li>
        ))}
        <li className="strip-all">
          <a href="/networks">
            All {NETWORKS.length} networks
          </a>
        </li>
      </ul>
    </nav>
  );
}

/** Every network with its price, change, size and how much news it has. Sorted by market cap. */
export function NetworkTable({ prices, clusters, now }: { prices: Prices; clusters: Cluster[]; now: number }) {
  const week = now - 7 * 24 * 3_600_000;
  const count = (slug: string) => clusters.filter((c) => c.latest >= week && c.networks.includes(slug)).length;
  return (
    <div className="table-wrap" role="region" aria-label="All networks" tabIndex={0}>
      <table className="networks-table">
        <caption className="visually-hidden">
          Every network on Hashwire with its token price, 24-hour change, market cap and number of stories this week
        </caption>
        <thead>
          <tr>
            <th scope="col">Network</th>
            <th scope="col" className="num">
              Price
            </th>
            <th scope="col" className="num">
              24h
            </th>
            <th scope="col" className="num hide-small">
              Market cap
            </th>
            <th scope="col" className="num">
              Stories this week
            </th>
          </tr>
        </thead>
        <tbody>
          {byMarketCap(prices.byNetwork).map((network) => {
            const price = prices.byNetwork[network.slug];
            return (
              <tr key={network.slug}>
                <th scope="row">
                  <a href={`/network/${network.slug}`} className="table-network">
                    <Dot slug={network.slug} />
                    <span>{network.name}</span>
                    {network.symbol && <span className="symbol">{network.symbol}</span>}
                  </a>
                </th>
                <td className="num">{price ? formatUsd(price.usd) : <span className="muted">No token</span>}</td>
                <td className="num">{price ? <Change change={price.change24h} /> : null}</td>
                <td className="num hide-small">{price?.marketCap ? formatCap(price.marketCap) : null}</td>
                <td className="num">{count(network.slug)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The biggest 24-hour moves up and down, for the side column. */
export function Movers({ prices }: { prices: Prices }) {
  const priced = NETWORKS.filter((n) => prices.byNetwork[n.slug]?.change24h != null).sort(
    (a, b) => prices.byNetwork[b.slug].change24h! - prices.byNetwork[a.slug].change24h!,
  );
  if (priced.length < 5) return null;
  const rows = [...priced.slice(0, 3), ...priced.slice(-2)];
  return (
    <section className="panel" aria-labelledby="movers">
      <h2 id="movers" className="panel-title">
        Biggest moves today
      </h2>
      <ul className="counted movers">
        {rows.map((network) => (
          <li key={network.slug}>
            <a href={`/network/${network.slug}`}>
              <span className="mover-name">
                <Dot slug={network.slug} />
                {network.name}
              </span>
              <Change change={prices.byNetwork[network.slug].change24h} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
