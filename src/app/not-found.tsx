import type { Metadata } from "next";
import Link from "next/link";

import { Frame } from "@/components/Frame";
import { NETWORKS } from "@/lib/networks";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <Frame>
      <div className="band band-short">
        <div className="band-inner">
          <h1>Page not found</h1>
          <div className="band-intro">
            <p>The link may be mistyped, or the page has moved.</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        <p>
          <Link href="/" className="button">
            See the latest news
          </Link>
        </p>
        <h2 className="small-heading">Or go to a network</h2>
        <ul className="inline-links">
          {NETWORKS.map((n) => (
            <li key={n.slug}>
              <Link href={`/network/${n.slug}`} prefetch={false}>
                {n.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}
