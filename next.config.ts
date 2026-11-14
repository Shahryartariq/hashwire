import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Paths people might guess, or that feed readers and browsers try on their own.
    return [
      { source: "/topics", destination: "/", permanent: true },
      { source: "/topic", destination: "/", permanent: true },
      { source: "/network", destination: "/networks", permanent: true },
      { source: "/source", destination: "/sources", permanent: true },
      { source: "/read", destination: "/", permanent: true },
      { source: "/feed", destination: "/feed.xml", permanent: true },
      { source: "/atom.xml", destination: "/feed.xml", permanent: true },
      { source: "/security.txt", destination: "/.well-known/security.txt", permanent: true },
      // Some tools still ask for /favicon.ico even though pages name /icon.svg.
      { source: "/favicon.ico", destination: "/icon.svg", permanent: true },
      { source: "/rss", destination: "/feed.xml", permanent: true },
      { source: "/rss.xml", destination: "/feed.xml", permanent: true },
    ];
  },
};

export default nextConfig;
