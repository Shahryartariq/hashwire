import type { ItemText, Source, SourceKind } from "./types";

const hasCategory = (item: ItemText, pattern: RegExp) => item.categories.some((c) => pattern.test(c));

/** Every feed Hashwire reads. Networks' own blogs come first: when two sources link the same URL, the first one keeps it. */
export const SOURCES: Source[] = [
  {
    slug: "ethereum-foundation",
    name: "Ethereum Foundation",
    homepage: "https://blog.ethereum.org/",
    feed: "https://blog.ethereum.org/en/feed.xml",
    kind: "network",
    network: "ethereum",
    about: "The Ethereum Foundation blog: protocol upgrades, testnet schedules, research and ecosystem support.",
  },
  {
    slug: "bitcoin-optech",
    name: "Bitcoin Optech",
    homepage: "https://bitcoinops.org/",
    feed: "https://bitcoinops.org/feed.xml",
    kind: "network",
    network: "bitcoin",
    about: "The weekly Bitcoin Optech newsletter and podcast on Bitcoin protocol and wallet development.",
  },
  {
    slug: "solana",
    name: "Solana",
    homepage: "https://solana.com/news",
    feed: "https://solana.com/news/rss.xml",
    kind: "network",
    network: "solana",
    about: "Official Solana news: weekly changelogs for Agave and Firedancer, ecosystem news and events.",
  },
  {
    slug: "sui",
    name: "Sui",
    homepage: "https://www.sui.io/blog",
    feed: "https://www.sui.io/blog/rss.xml",
    kind: "network",
    network: "sui",
    about: "The Sui blog: launches, partnerships and explainers from the Sui ecosystem.",
  },
  {
    slug: "base",
    name: "Base",
    homepage: "https://www.base.org/blog",
    feed: "https://www.base.org/blog/rss.xml",
    kind: "network",
    network: "base",
    about: "The Base blog: builder programs and stories from apps running on Coinbase's layer 2.",
  },
  {
    slug: "kraken",
    name: "Kraken",
    homepage: "https://blog.kraken.com/",
    feed: "https://blog.kraken.com/feed",
    kind: "exchange",
    about: "New asset listings and trading features from the Kraken exchange. Event and VIP posts are left out.",
    include: (item) => hasCategory(item, /asset listings|new features|trading/i) && !hasCategory(item, /vip/i),
  },
  {
    slug: "coindesk",
    name: "CoinDesk",
    homepage: "https://www.coindesk.com/",
    feed: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    kind: "press",
    about: "One of the longest-running crypto newsrooms: markets, policy, business and technology.",
  },
  {
    slug: "cointelegraph",
    name: "Cointelegraph",
    homepage: "https://cointelegraph.com/",
    feed: "https://cointelegraph.com/rss",
    kind: "press",
    about: "Fast-moving crypto news and market reports. Its daily round-up is left out.",
    include: (item) => !/what happened in crypto today/i.test(item.title),
  },
  {
    slug: "decrypt",
    name: "Decrypt",
    homepage: "https://decrypt.co/",
    feed: "https://decrypt.co/feed",
    kind: "press",
    about: "Crypto news for a wide audience. Its AI stories are left out.",
    include: (item) => !hasCategory(item, /artificial intelligence/i),
  },
  {
    slug: "the-block",
    name: "The Block",
    homepage: "https://www.theblock.co/",
    feed: "https://www.theblock.co/rss.xml",
    kind: "press",
    about: "Crypto business, markets and policy reporting. Its Campus explainers are left out.",
    include: (item) => !hasCategory(item, /campus/i) && !/\/learn\//.test(item.url),
  },
  {
    slug: "bitcoin-magazine",
    name: "Bitcoin Magazine",
    homepage: "https://bitcoinmagazine.com/",
    feed: "https://bitcoinmagazine.com/feed",
    kind: "press",
    about: "News, interviews and analysis focused on Bitcoin since 2012.",
  },
  {
    slug: "cryptoslate",
    name: "CryptoSlate",
    homepage: "https://cryptoslate.com/",
    feed: "https://cryptoslate.com/feed/",
    kind: "press",
    about: "Crypto news and market analysis, with a focus on exchanges and onchain data.",
  },
  {
    slug: "the-defiant",
    name: "The Defiant",
    homepage: "https://thedefiant.io/",
    feed: "https://thedefiant.io/api/feed",
    kind: "press",
    about: "News on DeFi, stablecoins, tokenization and the regulation around them.",
  },
];

const BY_SLUG = new Map(SOURCES.map((source) => [source.slug, source]));

export function sourceBySlug(slug: string): Source | undefined {
  return BY_SLUG.get(slug);
}

export function sourceName(slug: string): string {
  return BY_SLUG.get(slug)?.name ?? slug;
}

export const KIND_LABEL: Record<SourceKind, string> = {
  network: "Network teams",
  press: "Newsrooms",
  exchange: "Exchanges",
};
