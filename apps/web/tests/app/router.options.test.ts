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

  it("scrolls to the anchor when the route has a hash", () => {
    expect(scrollBehavior(location("#visit"), null)).toEqual({
      el: "#visit",
      top: 0,
    });
  });

  it("jumps to the top without animating otherwise", () => {
    expect(scrollBehavior(location(), null)).toEqual({
      left: 0,
      top: 0,
      behavior: "instant",
    });
  });
});
