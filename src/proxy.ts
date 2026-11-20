import { NextResponse, type NextRequest } from "next/server";

import { measurementId } from "@/lib/analytics";
import { buildCsp } from "@/lib/csp";
import { resolveSection, type SectionKind } from "@/lib/routes";

const SECTION = /^\/(topic|source|network)\/([^/]+)\/?$/;

/**
 * A fresh nonce per request for a strict Content Security Policy: only scripts and styles
 * that Next.js itself rendered with the nonce may run.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Unknown networks, topics and sources get a real 404 status before any HTML is streamed.
  // A different spelling of a real one ("/network/BTC") goes to its proper address.
  const section = SECTION.exec(pathname);
  if (section) {
    const slug = resolveSection(section[1] as SectionKind, section[2]);
    if (!slug) return NextResponse.rewrite(new URL("/_not-a-page", request.url));
    const proper = `/${section[1]}/${slug}`;
    if (pathname !== proper) {
      const url = request.nextUrl.clone();
      url.pathname = proper;
      return NextResponse.redirect(url, 308);
    }
  }

  // Page 1 has one address, without the parameter.
  if (searchParams.get("page") === "1") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("page");
    return NextResponse.redirect(url, 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = buildCsp({ nonce, dev: isDev, analytics: measurementId() !== null });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|\\.well-known|apple-icon|feed.xml|sitemap.xml|robots.txt|manifest.webmanifest|opengraph-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
