import { describe, expect, it } from "vitest";

import { pageHref, paginate, pagedRobots, pagedTitle, readPage } from "./paging";

describe("paging", () => {
  it("reads ?page=, and rejects anything that isn't a page number", () => {
    expect(readPage(undefined)).toBe(1);
    expect(readPage("3")).toBe(3);
    expect(readPage(["2", "5"])).toBe(2);
    for (const bad of ["0", "-1", "1.5", "abc", "", "01", "99999"]) expect(readPage(bad), bad).toBeNull();
  });

  it("slices pages, keeps an empty page 1 and says no to pages past the end", () => {
    const items = Array.from({ length: 65 }, (_, i) => i);
    expect(paginate(items, 1)).toMatchObject({ page: 1, pages: 3 });
    expect(paginate(items, 1)!.items).toHaveLength(30);
    expect(paginate(items, 3)!.items).toEqual([60, 61, 62, 63, 64]);
    expect(paginate(items, 4)).toBeNull();
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pages: 1 });
  });

  it("keeps page 1's address clean and later pages out of the index", () => {
    expect(pageHref("/topic/defi", 1)).toBe("/topic/defi");
    expect(pageHref("/topic/defi", 2)).toBe("/topic/defi?page=2");
    expect(pagedRobots(1)).toEqual({});
    expect(pagedRobots(2)).toEqual({ robots: { index: false, follow: true } });
    expect(pagedTitle("DeFi news", 1)).toBe("DeFi news");
    expect(pagedTitle("DeFi news", 2)).toBe("DeFi news · page 2");
  });
});
