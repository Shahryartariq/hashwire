import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/Section";
import { pageHref, pagedRobots, pagedTitle, readPage } from "@/lib/paging";
import { getWire, inTopic } from "@/lib/load";
import { pageMeta } from "@/lib/site";
import { topicBySlug } from "@/lib/topics";

export async function generateMetadata({ params, searchParams }: PageProps<"/topic/[slug]">): Promise<Metadata> {
  const topic = topicBySlug((await params).slug);
  if (!topic) return {};
  const path = `/topic/${topic.slug}`;
  const page = readPage((await searchParams).page) ?? 1;
  return {
    title: pagedTitle(topic.title, page),
    description: topic.description,
    ...pageMeta(pageHref(path, page), topic.title, topic.description, `${path}/opengraph-image`),
    ...pagedRobots(page),
  };
}

export default async function TopicPage({ params, searchParams }: PageProps<"/topic/[slug]">) {
  const page = readPage((await searchParams).page);
  if (page === null) notFound();
  const topic = topicBySlug((await params).slug);
  if (!topic) notFound();
  const wire = await getWire();
  return (
    <Section
      page={page}
      wire={wire}
      clusters={wire.clusters.filter((c) => inTopic(c, topic.slug))}
      active={topic.slug}
      path={`/topic/${topic.slug}`}
      name={topic.name}
      title={topic.title}
      intro={<p>{topic.intro}</p>}
      emptyText={`No ${topic.name.toLowerCase()} stories in the last three weeks.`}
    />
  );
}
