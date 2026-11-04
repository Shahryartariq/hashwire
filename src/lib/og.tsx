import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const BAND = "#1E1030";
const CELL = "#4A3963";
const AMBER = "#FFA62B";

function Blocks({ height }: { height: number }) {
  const width = Math.round(height * 0.875);
  const gap = Math.round(height * 0.12);
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {[CELL, CELL, AMBER].map((color, i) => (
        <div key={i} style={{ width, height, borderRadius: height / 5, background: color }} />
      ))}
    </div>
  );
}

/** The social card: aubergine band, the mark, a large title, one line under it, and an optional network colour. */
export function ogImage(title: string, subtitle: string, accent = AMBER) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: BAND,
          color: "#fff",
          borderTop: `16px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 46, fontWeight: 700 }}>
          <Blocks height={34} />
          Hashwire
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2, lineHeight: 1.02, maxWidth: 1040 }}>{title}</div>
          <div style={{ fontSize: 34, color: "#CFC3DD" }}>{subtitle}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

export function iconImage(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BAND }}>
        <Blocks height={Math.round(size * 0.3)} />
      </div>
    ),
    { width: size, height: size },
  );
}
