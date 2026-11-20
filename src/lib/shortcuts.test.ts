import { describe, expect, it } from "vitest";

import { shortcuts } from "./shortcuts";

describe("search shortcuts", () => {
  it("offers a network, topic or source page when its exact name is typed", () => {
    expect(shortcuts("Solana").map((s) => s.href)).toEqual(["/network/solana", "/source/solana"]);
    expect(shortcuts("sol").map((s) => s.href)).toEqual(["/network/solana"]);
    expect(shortcuts("defi").map((s) => s.href)).toEqual(["/topic/defi"]);
    expect(shortcuts("CoinDesk").map((s) => s.href)).toEqual(["/source/coindesk"]);
  });

  it("offers nothing for phrases or very short queries", () => {
    expect(shortcuts("solana etf flows")).toEqual([]);
    expect(shortcuts("s")).toEqual([]);
    expect(shortcuts("")).toEqual([]);
  });
});
