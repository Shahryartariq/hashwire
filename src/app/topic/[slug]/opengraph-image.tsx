import { OG_SIZE, ogImage } from "@/lib/og";
import { TOPICS, topicBySlug } from "@/lib/topics";

export const alt = "Hashwire topic page";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return TOPICS.map((topic) => ({ slug: topic.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const topic = topicBySlug((await params).slug);
  return ogImage(topic ? topic.name : "Crypto news", "Crypto news from 13 sources, by network");
}
