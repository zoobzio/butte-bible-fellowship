import { describe, expect, it } from "vitest";

import { isWithin, parentPath } from "~/utils/navigation";

describe("isWithin", () => {
  it("holds a section's own page and the pages under it", () => {
    expect(isWithin("/events", "/events")).toBe(true);
    expect(isWithin("/events/potluck", "/events")).toBe(true);
  });

  it("leaves out a page that only starts as the section does", () => {
    expect(isWithin("/events-archive", "/events")).toBe(false);
    expect(isWithin("/connect", "/events")).toBe(false);
  });

  it("holds the home page alone within the root", () => {
    expect(isWithin("/", "/")).toBe(true);
    expect(isWithin("/events", "/")).toBe(false);
  });
});

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
