import type { Network } from "./types";

/** A ticker on its own, optionally written as a cashtag: "BTC", "$SOL". */
const ticker = (symbol: string) => new RegExp(`(?<![A-Za-z0-9])\\$?${symbol}(?![A-Za-z0-9])`);

/**
 * Every network with its own page. Order is the order of the menu; pages that list
 * networks by size sort them by market cap instead.
 *
 * Matching rules are deliberately specific: "Avalanche", "Base" and "Optimism" are
 * ordinary words, so they only count in phrases that can't mean anything else.
 */
export const NETWORKS: Network[] = [
  {
    slug: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    coingecko: "bitcoin",
    color: "#F7931A",
    homepage: "https://bitcoin.org/",
    about:
      "The first blockchain, running since 2009: proof of work, a fixed supply of 21 million coins, and the Lightning Network for fast payments.",
    names: /\b(bitcoin|btc|lightning network|ordinals|runes protocol|satoshi nakamoto|taproot|bitcoin core|silent payments?|l-btc)\b/i,
  },
  {
    slug: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    coingecko: "ethereum",
    color: "#627EEA",
    homepage: "https://ethereum.org/",
    about:
      "The largest smart-contract platform and home to most of DeFi, stablecoins and the layer 2 networks built on top of it. Proof of stake since 2022.",
    names:
      // "Layer 2" alone isn't enough: Bitcoin has layer 2s too.
      /\b(ethereum|ether|vitalik|buterin|eips?-\d+|erc-?20|erc-?4337|pectra|fusaka|glamsterdam|hoodi|ethereum foundation)\b/i,
    exact: [ticker("ETH")],
  },
  {
    slug: "solana",
    name: "Solana",
    symbol: "SOL",
    coingecko: "solana",
    color: "#9945FF",
    homepage: "https://solana.com/",
    about:
      "A fast, low-fee layer 1 popular for trading, payments and consumer apps. Its validator clients include Agave and Firedancer.",
    names: /\b(solana|firedancer|agave|alpenglow|pump\.fun|breakpoint 20\d\d)\b/i,
    exact: [ticker("SOL")],
  },
  {
    slug: "bnb-chain",
    name: "BNB Chain",
    symbol: "BNB",
    coingecko: "binancecoin",
    color: "#F0B90B",
    homepage: "https://www.bnbchain.org/",
    about: "The EVM chain started by Binance, with BNB as its gas token. Busy with trading and DeFi apps.",
    names: /\b(bnb chain|bnb smart chain|binance smart chain|bsc|opbnb)\b/i,
    exact: [ticker("BNB")],
  },
  {
    slug: "xrp-ledger",
    name: "XRP Ledger",
    symbol: "XRP",
    coingecko: "ripple",
    color: "#7A8794",
    homepage: "https://xrpl.org/",
    about:
      "A payments-focused ledger running since 2012 and closely tied to Ripple. Its native asset is XRP, and it hosts the RLUSD stablecoin.",
    names: /\b(xrp|xrpl|xrp ledger|ripple|rlusd)\b/i,
  },
  {
    slug: "cardano",
    name: "Cardano",
    symbol: "ADA",
    coingecko: "cardano",
    color: "#0033AD",
    homepage: "https://cardano.org/",
    about: "A proof-of-stake layer 1 built with a research-first approach by Input Output and the Cardano Foundation.",
    names: /\b(cardano|charles hoskinson|input output global)\b/i,
    exact: [ticker("ADA")],
  },
  {
    slug: "tron",
    name: "Tron",
    symbol: "TRX",
    coingecko: "tron",
    color: "#FF060A",
    homepage: "https://tron.network/",
    about: "A layer 1 founded by Justin Sun that carries a large share of all USDT stablecoin transfers.",
    names: /\b(tron|trc-?20)\b/i,
    exact: [ticker("TRX")],
  },
  {
    slug: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    coingecko: "dogecoin",
    color: "#C2A633",
    homepage: "https://dogecoin.com/",
    about: "The original meme coin: a proof-of-work chain launched in 2013 from Litecoin's code.",
    // "DOGE" alone is also a US government department, so only the full name counts.
    names: /\bdogecoin\b/i,
  },
  {
    slug: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    coingecko: "avalanche-2",
    color: "#E84142",
    homepage: "https://www.avax.network/",
    about: "A layer 1 with fast finality where projects launch their own chains, developed by Ava Labs.",
    names: /\b(avalanche (network|blockchain|c-chain|foundation|l1s?|subnets?)|ava labs|avax)\b/i,
  },
  {
    slug: "ton",
    name: "TON",
    symbol: "TON",
    coingecko: "the-open-network",
    color: "#0098EA",
    homepage: "https://ton.org/",
    about: "The Open Network, the blockchain built into Telegram's wallet and mini apps.",
    names: /\b(the open network|toncoin|ton blockchain|ton foundation)\b/i,
    exact: [ticker("TON")],
  },
  {
    slug: "polygon",
    name: "Polygon",
    symbol: "POL",
    coingecko: "polygon-ecosystem-token",
    color: "#8247E5",
    homepage: "https://polygon.technology/",
    about: "A payments-focused network connected to Ethereum, with POL as its token and AggLayer to link chains together.",
    names: /\b(polygon|agglayer)\b/i,
  },
  {
    slug: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    coingecko: "arbitrum",
    color: "#28A0F0",
    homepage: "https://arbitrum.io/",
    about: "One of the largest Ethereum layer 2 networks, built by Offchain Labs with optimistic rollups.",
    names: /\b(arbitrum|offchain labs)\b/i,
    exact: [ticker("ARB")],
  },
  {
    slug: "optimism",
    name: "Optimism",
    symbol: "OP",
    coingecko: "optimism",
    color: "#FF0420",
    homepage: "https://www.optimism.io/",
    about: "OP Mainnet and the OP Stack, the shared software behind the Superchain of layer 2 networks, Base included.",
    names: /\b(op mainnet|op stack|superchain|optimism (foundation|collective|network|mainnet)|op labs)\b/i,
  },
  {
    slug: "base",
    name: "Base",
    color: "#0052FF",
    homepage: "https://www.base.org/",
    about: "Coinbase's Ethereum layer 2, built on the OP Stack. It has no network token.",
    names: /\b(jesse pollak|base\.org)\b/i,
    exact: [/\bBase (network|chain|app|mainnet|L2|Batches)\b/, /\b(on|to) Base\b/, /\bCoinbase['’]s Base\b/],
  },
  {
    slug: "sui",
    name: "Sui",
    symbol: "SUI",
    coingecko: "sui",
    color: "#4DA2FF",
    homepage: "https://sui.io/",
    about: "A layer 1 from Mysten Labs built around the Move language and an object-based data model.",
    names: /\b(sui|mysten labs|usdsui)\b/i,
  },
  {
    slug: "aptos",
    name: "Aptos",
    symbol: "APT",
    coingecko: "aptos",
    color: "#2DD8A3",
    homepage: "https://aptosfoundation.org/",
    about: "A Move-based layer 1 started by engineers from Meta's Diem project, focused on fast parallel execution.",
    names: /\baptos\b/i,
    exact: [ticker("APT")],
  },
  {
    slug: "near",
    name: "NEAR",
    symbol: "NEAR",
    coingecko: "near",
    color: "#00C08B",
    homepage: "https://near.org/",
    about: "A sharded layer 1 focused on chain abstraction, letting apps and AI agents act across many chains.",
    names: /\b(near protocol|near foundation|near intents|near ai|illia polosukhin)\b/i,
    exact: [ticker("NEAR")],
  },
  {
    slug: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    coingecko: "polkadot",
    color: "#E6007A",
    homepage: "https://polkadot.com/",
    about: "A network of connected chains secured together, founded by Ethereum co-founder Gavin Wood.",
    names: /\b(polkadot|kusama|parity technologies|gavin wood)\b/i,
    exact: [ticker("DOT")],
  },
  {
    slug: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
    coingecko: "cosmos",
    color: "#6F7390",
    homepage: "https://cosmos.network/",
    about: "The Cosmos Hub, plus the SDK and IBC protocol that let independent blockchains connect to each other.",
    names: /\b(cosmos (hub|sdk|network|ecosystem)|interchain|ibc protocol)\b/i,
    exact: [ticker("ATOM")],
  },
  {
    slug: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    coingecko: "chainlink",
    color: "#375BD2",
    homepage: "https://chain.link/",
    about: "The largest oracle network, bringing price feeds and other outside data to smart contracts, plus the CCIP cross-chain protocol.",
    names: /\b(chainlink|ccip)\b/i,
    exact: [ticker("LINK")],
  },
  {
    slug: "litecoin",
    name: "Litecoin",
    symbol: "LTC",
    coingecko: "litecoin",
    color: "#345D9D",
    homepage: "https://litecoin.org/",
    about: "A 2011 fork of Bitcoin with faster blocks, one of the oldest coins still in wide use.",
    names: /\b(litecoin|ltc)\b/i,
  },
  {
    slug: "hyperliquid",
    name: "Hyperliquid",
    symbol: "HYPE",
    coingecko: "hyperliquid",
    color: "#50D2C1",
    homepage: "https://hyperfoundation.org/",
    about: "A layer 1 built for trading, best known for its onchain perpetual futures exchange.",
    names: /\b(hyperliquid|hyperevm)\b/i,
    exact: [ticker("HYPE")],
  },
];

const BY_SLUG = new Map(NETWORKS.map((n) => [n.slug, n]));

export function networkBySlug(slug: string): Network | undefined {
  return BY_SLUG.get(slug);
}

export function networkName(slug: string): string {
  return BY_SLUG.get(slug)?.name ?? slug;
}

function mentions(network: Network, text: string): boolean {
  return network.names.test(text) || (network.exact ?? []).some((pattern) => pattern.test(text));
}

/**
 * Networks a story is about: the source's own network first, then networks named in the
 * headline, then in the summary or the feed's categories. At most four.
 */
export function networksFor(title: string, summary: string, categories: string[], own?: string): string[] {
  const body = `${summary} ${categories.join(" ")}`;
  const inTitle = NETWORKS.filter((n) => mentions(n, title)).map((n) => n.slug);
  const inBody = NETWORKS.filter((n) => !inTitle.includes(n.slug) && mentions(n, body)).map((n) => n.slug);
  const ordered = [...(own ? [own] : []), ...inTitle, ...inBody];
  return [...new Set(ordered)].slice(0, 4);
}
