import { describe, expect, it } from "vitest";

import { resolveSection } from "./routes";

describe("resolveSection", () => {
  it("finds pages by their slug, in any case", () => {
    expect(resolveSection("network", "bitcoin")).toBe("bitcoin");
    expect(resolveSection("network", "Bitcoin")).toBe("bitcoin");
    expect(resolveSection("topic", "DeFi")).toBe("defi");
    expect(resolveSection("source", "coindesk")).toBe("coindesk");
  });

  it("finds networks by their ticker", () => {
    expect(resolveSection("network", "btc")).toBe("bitcoin");
    expect(resolveSection("network", "ETH")).toBe("ethereum");
    expect(resolveSection("network", "sol")).toBe("solana");
  });

  it("returns null for unknown pages and malformed addresses instead of throwing", () => {
    expect(resolveSection("network", "nope")).toBeNull();
    expect(resolveSection("topic", "btc")).toBeNull();
    expect(resolveSection("network", "%E0%A4%A")).toBeNull();
  });
});
