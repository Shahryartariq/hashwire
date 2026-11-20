import { SOURCE_URL, absolute } from "@/lib/site";

/** Rebuilt at most once a day, so the expiry date keeps moving forward. */
export const revalidate = 86400;

/** Where to report a security problem (RFC 9116). Reports go to GitHub's private advisories. */
export function GET() {
  const expires = new Date(Date.now() + 365 * 86_400_000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: ${SOURCE_URL}/security/advisories/new`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    `Canonical: ${absolute("/.well-known/security.txt")}`,
    `Policy: ${SOURCE_URL}/blob/main/SECURITY.md`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
