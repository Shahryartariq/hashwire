import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/Section";
import { fromSource, getWire } from "@/lib/load";
import { pageHref, pagedRobots, pagedTitle, readPage } from "@/lib/paging";
import { pageMeta } from "@/lib/site";
import { sourceBySlug } from "@/lib/sources";
import { agoLong } from "@/lib/time";

export async function generateMetadata({ params, searchParams }: PageProps<"/source/[slug]">): Promise<Metadata> {
  const source = sourceBySlug((await params).slug);
  if (!source) return {};
  const path = `/source/${source.slug}`;
  const page = readPage((await searchParams).page) ?? 1;
  const title = sourceTitle(source.name);
  const description = `${source.about} The latest posts, updated every 15 minutes.`;
  return {
    title: pagedTitle(title, page),
    description,
    ...pageMeta(pageHref(path, page), title, description),
    ...pagedRobots(page),
  };
}

export default async function SourcePage({ params, searchParams }: PageProps<"/source/[slug]">) {
  const page = readPage((await searchParams).page);
  if (page === null) notFound();
  const source = sourceBySlug((await params).slug);
  if (!source) notFound();
  const wire = await getWire();
  const feed = wire.feeds.find((f) => f.slug === source.slug);
  return (
    <Section
      page={page}
      wire={wire}
      clusters={wire.clusters.filter((c) => fromSource(c, source.slug))}
      path={`/source/${source.slug}`}
      name={source.name}
      title={sourceTitle(source.name)}
      intro={<p>{source.about}</p>}
      extra={
        <p className="band-links">
          <a href={source.homepage} rel="noopener">
            Visit {source.name}
          </a>
          {feed?.stale && (
            <span className="warn">The feed isn&apos;t responding; these stories are from {agoLong(feed.fetchedAt, wire.now)}.</span>
          )}
          {feed && !feed.ok && !feed.stale && <span className="warn">The feed isn&apos;t responding right now.</span>}
        </p>
      }
      emptyText={`Nothing from ${source.name} in the last three weeks.`}
    />
  );
}

function sourceTitle(name: string): string {
  return `${name}: latest crypto news`;
}
