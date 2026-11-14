"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * "Back to the news": returns to the list the reader came from, at the place they left it, when
 * they arrived from a Hashwire page. Otherwise (a shared link, a new tab, no JavaScript) it is a
 * plain link to the front page.
 */
export function BackLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/"
      className={className}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        let cameFromHere = false;
        try {
          cameFromHere = new URL(document.referrer).origin === window.location.origin;
        } catch {
          // No referrer.
        }
        if (cameFromHere && window.history.length > 1) {
          event.preventDefault();
          window.history.back();
        }
      }}
    >
      {children}
    </Link>
  );
}
