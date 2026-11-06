import { describe, expect, it } from "vitest";

import { parentPath } from "~/utils/navigation";

describe("parentPath", () => {
  it("drops the page's last segment", () => {
    expect(parentPath("/events/potluck")).toBe("/events");
    expect(parentPath("/a/b/c")).toBe("/a/b");
  });

  it("puts a top-level page, and the home page, under the home page", () => {
    expect(parentPath("/events")).toBe("/");
    expect(parentPath("/")).toBe("/");
  });
});
