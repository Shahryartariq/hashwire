import type { TopicSlug } from "./types";

export interface Topic {
  slug: TopicSlug;
  name: string;
  /** Label in the section nav, where space is tight. */
  short?: string;
  /** Page title for search engines. */
  title: string;
  description: string;
  /** Opening paragraph on the topic page. */
  intro: string;
  pattern: RegExp;
}

/**
 * Topics are assigned with keyword rules on the headline, summary and the feed's own categories.
 * The rules are deliberately narrow: a missed topic is better than a wrong one.
 */
export const TOPICS: Topic[] = [
  {
    slug: "markets",
    name: "Markets",
    title: "Crypto market news: prices, trading and liquidations",
    description: "What moved crypto prices today: rallies and sell-offs, liquidations, futures, ETF flows and the traders behind them.",
    intro:
      "Price moves and why they happened: rallies, sell-offs, liquidations, futures and options, and the flows that drive them.",
    pattern:
      /\b(prices?|rall(y|ies|ied)|surg(e|es|ed|ing)|slump\w*|plung(e|es|ed)|dips?|rebound\w*|recover(s|ed|y)|liquidations?|bull(ish)?|bear(ish)?|market caps?|all-time high|traders?|trading|volatil\w+|futures|perps?|perpetuals?|options|open interest|sell-?off|outflows?|inflows?|whales?|lows?|highs?|slides?|lags?)\b/i,
  },
  {
    slug: "institutions",
    name: "ETFs and institutions",
    short: "ETFs",
    title: "Crypto ETF and institutional news",
    description: "Crypto ETFs, banks, asset managers, treasury companies and tokenized stocks and funds: how big money is moving into crypto.",
    intro:
      "Spot ETFs and their flows, banks and asset managers, companies holding crypto in their treasury, and tokenized stocks, bonds and funds.",
    pattern:
      /\b(etfs?|etps?|blackrock|fidelity|grayscale|bitwise|vaneck|ark invest|ibit|institution(s|al)?|treasur(y|ies) compan\w+|digital asset treasur\w+|saylor|tokeniz\w+|tokenis\w+|morgan stanley|jpmorgan|goldman|dtcc|banks?|asset managers?|rwas?|real[- ]world assets?)\b/i,
  },
  {
    slug: "regulation",
    name: "Regulation",
    title: "Crypto regulation and policy news",
    description: "Crypto rules around the world: the SEC and CFTC, Congress and the CLARITY Act, MiCA, taxes, court cases and elections.",
    intro:
      "Lawmakers, regulators and courts: the SEC and CFTC, bills in Congress, MiCA in Europe, tax rules, lawsuits and the politics behind them.",
    pattern:
      /\b(sec|cftc|regulat\w*|lawmakers?|legislation|congress|senat(e|or|ors)|clarity act|genius act|digital asset basic act|mica|lawsuits?|court|judge|sue[sd]?|sanctions?|tax(es|ation)?|licen[cs]\w*|ban(s|ned)?|compliance|enforcement|no-action|policy|policymaking|midterms?|elections?|doj|fsc|prosecutors?|cease-and-desist)\b/i,
  },
  {
    slug: "defi",
    name: "DeFi",
    title: "DeFi news: lending, DEXs, staking and prediction markets",
    description: "Decentralized finance news: DEXs, lending, staking and restaking, yield, onchain perpetuals and prediction markets.",
    intro:
      "Finance that runs on smart contracts: exchanges, lending markets, staking and restaking, onchain derivatives and prediction markets.",
    pattern:
      /\b(defi|decentralized finance|dex(es)?|amms?|liquidity pools?|lending|borrow\w*|yields?|staking|restaking|liquid staking|aave|uniswap|lido|eigenlayer|curve|pendle|morpho|ethena|tvl|prediction markets?|polymarket|kalshi|world liberty|wlfi|thorchain)\b/i,
  },
  {
    slug: "stablecoins",
    name: "Stablecoins",
    title: "Stablecoin news: Tether, USDC and payments",
    description: "Stablecoin news: Tether and USDT, Circle and USDC, new dollar and euro tokens, reserves and payments built on them.",
    intro:
      "Dollar and euro tokens and the companies behind them: Tether, Circle, new issuers, reserve reports and the payments built on stablecoins.",
    pattern:
      /\b(stablecoins?|usdt|usdc|tether|circle|rlusd|usde|pyusd|usdg|usd1|dai|eurc|eurcv|usdsui|cbdcs?|digital (euro|pound|dollar)|global dollar|payments?)\b/i,
  },
  {
    slug: "security",
    name: "Hacks and security",
    short: "Security",
    title: "Crypto hacks, exploits and security news",
    description: "Crypto hacks and exploits, stolen funds and where they went, scams, North Korean attackers and security research.",
    intro:
      "Hacks, exploits and scams, how stolen funds move afterwards, and the researchers and investigators who track them.",
    pattern:
      /\b(hack(s|ed|er|ers)?|exploit(s|ed)?|drain(ed|s)?|stolen|theft|thefts|phishing|scams?|fraud|vulnerabilit\w+|attack(er|ers|s)?|lazarus|north korea\w*|launder\w*|zachxbt|backdoor\w*|denial-of-service|cyber threats?|lockdown)\b/i,
  },
  {
    slug: "exchanges",
    name: "Exchanges",
    title: "Crypto exchange news: Binance, Coinbase, Kraken and listings",
    description: "News from crypto exchanges: Binance, Coinbase, Kraken, OKX and others, new listings, withdrawals and outages.",
    intro:
      "The exchanges where most trading happens: Binance, Coinbase, Kraken, OKX and others, plus new listings, withdrawals and outages.",
    pattern:
      /\b(exchanges?|binance|coinbase|kraken|okx|bybit|bitget|crypto\.com|upbit|bithumb|robinhood|bitgo|listings?|listed|delist\w*|withdrawals?|deposits?|available for trading)\b/i,
  },
  {
    slug: "development",
    name: "Development",
    title: "Blockchain development news: upgrades, testnets and releases",
    description: "What developers are shipping: network upgrades and hard forks, testnets, client releases, protocol research and newsletters.",
    intro:
      "What the people building blockchains are shipping: upgrades and forks, testnet schedules, client releases and protocol research.",
    pattern:
      /\b(upgrades?|hard forks?|soft forks?|testnets?|mainnet|devnet|changelog|clients?|eips?-?\d*|bips?|protocol|developers?|sdks?|validators?|consensus|zero-knowledge|zk\w*|rollups?|silent payments?|newsletter|research|cli|gas limit)\b/i,
  },
];

const BY_SLUG = new Map(TOPICS.map((topic) => [topic.slug, topic]));

export function topicBySlug(slug: string): Topic | undefined {
  return BY_SLUG.get(slug as TopicSlug);
}

/** Up to three topics, preferring matches in the headline over matches in the summary. */
export function topicsFor(title: string, summary: string, categories: string[]): TopicSlug[] {
  const body = `${summary} ${categories.join(" ")}`;
  const inTitle = TOPICS.filter((t) => t.pattern.test(title)).map((t) => t.slug);
  const inBody = TOPICS.filter((t) => !inTitle.includes(t.slug) && t.pattern.test(body)).map((t) => t.slug);
  return [...inTitle, ...inBody].slice(0, 3);
}
