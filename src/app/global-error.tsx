"use client";

import "./globals.css";

/**
 * The last resort: shown when the root layout itself fails, so it brings its own <html>.
 * A full reload is the retry, because the layout has to be built again.
 */
export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main id="main" className="error-page">
          <h1>Hashwire didn&apos;t load</h1>
          <p>Something went wrong on our side. It&apos;s usually brief.</p>
          <p className="actions">
            {/* A plain link, not next/link: the app that would handle it is what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="button">
              Reload the front page
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
