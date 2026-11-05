import { OG_SIZE, ogImage } from "@/lib/og";
import { SOURCES } from "@/lib/sources";

export const alt = "Hashwire: crypto and blockchain news, network by network";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage("Crypto news, network by network", `22 blockchains, ${SOURCES.length} sources, prices every 10 minutes`);
}
