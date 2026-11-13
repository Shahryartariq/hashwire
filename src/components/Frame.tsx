import Link from "next/link";

import { measurementId } from "@/lib/analytics";
import { SOURCE_URL } from "@/lib/site";
import { TOPICS } from "@/lib/topics";

import { Mark } from "./Mark";
import { ThemeSwitch } from "./ThemeSwitch";

/** Page shell shared by every page: skip link, masthead with search and topics, footer. */
export function Frame({
  active,
  query,
  sample,
  children,
}: {
  /** "home", "networks" or a topic slug, to mark the current section in the nav. */
  active?: string;
  query?: string;
  sample?: boolean;
  children: React.ReactNode;
}) {
  const sections = [
    { href: "/", key: "home", label: "All news" },
    { href: "/networks", key: "networks", label: "Networks" },
    ...TOPICS.map((t) => ({ href: `/topic/${t.slug}`, key: t.slug, label: t.short ?? t.name })),
  ];
  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to the news
      </a>
      <header className="masthead">
        <div className="masthead-row">
          <Link href="/" className="brand" aria-label="Hashwire home">
            <Mark />
            <span>Hashwire</span>
          </Link>
          <form className="search" action="/search" method="get" role="search">
            <label htmlFor="q" className="visually-hidden">
              Search crypto news
            </label>
            <input id="q" name="q" type="search" placeholder="Search crypto news" defaultValue={query} maxLength={80} autoComplete="off" />
            <button type="submit">Search</button>
          </form>
          <ThemeSwitch />
        </div>
        <nav aria-label="Sections" className="sections">
          <ul>
            {sections.map((s) => (
              <li key={s.key}>
                <Link href={s.href} aria-current={active === s.key ? "page" : undefined}>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-brand">
            <Mark /> Hashwire
          </p>
          <p>
            Every headline links to the publisher&apos;s article. Prices by{" "}
            <a href="https://www.coingecko.com/" rel="noopener">
              CoinGecko
            </a>
            . Nothing here is investment advice.
          </p>
          <ul className="footer-links">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/sources">Sources</Link>
            </li>
            <li>
              <a href="/feed.xml">RSS feed</a>
            </li>
            <li>
              <a href={SOURCE_URL} rel="noopener">
                Source code
              </a>
            </li>
          </ul>
          {measurementId() && <p className="footer-note">Visits are counted with Google Analytics.</p>}
          {sample && <p className="sample-badge">Sample data: a saved snapshot of the feeds, for development.</p>}
          <p className="footer-note">
            Built by{" "}
            <a href="https://github.com/Shahryartariq" rel="noopener">
              Muhammad Shehryar
            </a>{" "}
            with Next.js and TypeScript.
          </p>
        </div>
      </footer>
    </div>
  );
}
