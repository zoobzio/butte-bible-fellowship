import type { RouteLocationNormalized } from "vue-router";

import { describe, expect, it } from "vitest";

import options from "~/router.options";

const location = (hash = "") => ({ hash }) as RouteLocationNormalized;

const scrollBehavior = (
  to: RouteLocationNormalized,
  saved: { left: number; top: number } | null,
) => options.scrollBehavior!(to, location(), saved);

describe("scrollBehavior", () => {
  it("restores the saved position on back and forward", () => {
    const saved = { left: 0, top: 640 };
    expect(scrollBehavior(location("#visit"), saved)).toBe(saved);
  });

  it("scrolls to the anchor, leaving a gap above it, when the route has a hash", () => {
    expect(scrollBehavior(location("#visit"), null)).toEqual({
      el: "#visit",
      top: 24,
    });
  });

  it("stops an anchor short of the header that covers the top, and the gap under it", () => {
    const header = document.createElement("header");
    header.className = "site-header";
    Object.defineProperty(header, "offsetHeight", { value: 96 });
    document.body.append(header);

    expect(scrollBehavior(location("#visit"), null)).toEqual({
      el: "#visit",
      top: 120,
    });
    header.remove();
  });

  it("jumps to the top without animating otherwise", () => {
    expect(scrollBehavior(location(), null)).toEqual({
      left: 0,
      top: 0,
      behavior: "instant",
    });
  });
});
