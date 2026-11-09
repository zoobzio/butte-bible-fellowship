import { describe, expect, it } from "vitest";

import { CONTENT_STATUSES, contentStatus } from "../../src/models/status";

describe("contentStatus", () => {
  it("is one of draft, published and archived", () => {
    expect(CONTENT_STATUSES).toEqual(["draft", "published", "archived"]);
    expect(contentStatus.parse("published")).toBe("published");
    expect(contentStatus.safeParse("hidden").success).toBe(false);
  });
});
