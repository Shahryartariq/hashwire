import { OG_SIZE, ogImage } from "@/lib/og";
import { NETWORKS, networkBySlug } from "@/lib/networks";

export const alt = "Hashwire network page";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return NETWORKS.map((network) => ({ slug: network.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const network = networkBySlug((await params).slug);
  return ogImage(network ? `${network.name} news` : "Crypto news", "News and price, updated every 15 minutes", network?.color);
}
