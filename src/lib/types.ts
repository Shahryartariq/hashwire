/** Who publishes a feed: a network's own team, a newsroom, a research, security or protocol team, or an exchange. */
export type SourceKind = "network" | "press" | "research" | "exchange";

export type TopicSlug =
  | "markets"
  | "institutions"
  | "regulation"
  | "defi"
  | "stablecoins"
  | "security"
  | "exchanges"
  | "development";

/** One item as it comes out of an RSS or Atom feed, before cleaning. */
export interface RawItem {
  title: string;
  link: string;
  /** Milliseconds since the epoch, or null when the feed gave no usable date. */
  date: number | null;
  /** Description, summary or content. May contain HTML. */
  summary: string;
  /** The fullest text in the item (content:encoded, Atom content, or the description), as HTML. */
  body?: string;
  categories: string[];
  /** A discussion page, when the feed has one. */
  comments?: string;
}

/** Cleaned text the source filters look at. */
export interface ItemText {
  title: string;
  text: string;
  categories: string[];
  url: string;
}

export interface Source {
  slug: string;
  name: string;
  homepage: string;
  feed: string;
  kind: SourceKind;
  /** One or two sentences for the source page. */
  about: string;
  /** For a network's own blog: every post is about that network. */
  network?: string;
  /** False when the feed's summaries are image captions or boilerplate rather than text. */
  summaries?: boolean;
  /** Keeps only the items worth showing (for feeds that also cover AI, events, tutorials…). */
  include?: (item: ItemText) => boolean;
  /** Round-up newsletters cover many stories at once, so they never join a story group. */
  digest?: boolean;
}

export interface Network {
  slug: string;
  name: string;
  /** Ticker of the network's token, if it has one. */
  symbol?: string;
  /** CoinGecko coin id for the price. */
  coingecko?: string;
  /** Brand colour, used only for a small marker next to the name. */
  color: string;
  homepage: string;
  about: string;
  /** Case-insensitive names, products and people that mean this network. */
  names: RegExp;
  /** Case-sensitive patterns, for tickers and words that are ambiguous in lower case. */
  exact?: RegExp[];
}

export interface Story {
  /** Stable id derived from the article URL. */
  id: string;
  source: string;
  title: string;
  url: string;
  publishedAt: number;
  summary?: string;
  topics: TopicSlug[];
  /** Networks the story is about. */
  networks: string[];
  discussion?: string;
  /** Minutes to read, when the feed carries enough of the post to read here (the reader view). */
  read?: number;
}

/** One news event: the main story and any other coverage of it. */
export interface Cluster {
  id: string;
  lead: Story;
  /** Every story in the group, lead first, then by time. */
  stories: Story[];
  /** Distinct sources in the group. */
  sources: string[];
  latest: number;
  topics: TopicSlug[];
  networks: string[];
}

export interface FeedResult {
  slug: string;
  /** Whether the latest attempt to read the feed worked. */
  ok: boolean;
  /** When these stories were read. */
  fetchedAt: number;
  stories: Story[];
  error?: string;
  /** The latest attempt failed and these stories are the last copy that loaded. */
  stale?: boolean;
  /** When the failed attempt was made, for stale copies. */
  checkedAt?: number;
}

export interface Price {
  usd: number;
  /** Percent change over 24 hours. */
  change24h: number | null;
  marketCap: number | null;
  updatedAt: number;
}

export interface Prices {
  ok: boolean;
  fetchedAt: number;
  /** Keyed by network slug. */
  byNetwork: Record<string, Price>;
}

export interface Wire {
  now: number;
  sample: boolean;
  stories: Story[];
  clusters: Cluster[];
  feeds: FeedResult[];
  prices: Prices;
}
