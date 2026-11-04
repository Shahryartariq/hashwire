/** The Hashwire mark: three blocks on a wire, the last one lit as the newest. */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" className="mark-wire" />
      <rect x="1" y="8" width="7" height="8" rx="1.5" className="mark-cell" />
      <rect x="8.5" y="8" width="7" height="8" rx="1.5" className="mark-cell" />
      <rect x="16" y="8" width="7" height="8" rx="1.5" className="mark-lit" />
    </svg>
  );
}
