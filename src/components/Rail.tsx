
import { mostCovered } from "@/lib/cluster";
import { sourceName } from "@/lib/sources";
import type { Cluster } from "@/lib/types";

export function MostCovered({ clusters, now, title = "Most covered this week" }: { clusters: Cluster[]; now: number; title?: string }) {
  const top = mostCovered(clusters, now);
  if (top.length === 0) return null;
  return (
    <section className="panel" aria-labelledby="most-covered">
      <h2 id="most-covered" className="panel-title">
        {title}
      </h2>
      <ol className="ranked">
        {top.map((cluster) => (
          <li key={cluster.id}>
            <a href={cluster.lead.url}>{cluster.lead.title}</a>
            <span className="ranked-meta">{cluster.sources.map(sourceName).join(", ")}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
