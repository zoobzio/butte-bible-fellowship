import { describe, expect, it } from "vitest";
import { clamp01, easeOutCubic, scrollProgress } from "~/utils/motion";

describe("clamp01", () => {
  it("clamps to the unit interval", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(2)).toBe(1);
  });
});

describe("easeOutCubic", () => {
  it("pins the endpoints", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("eases out (past the midpoint by t=0.5)", () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("scrollProgress", () => {
  it("is 0 at the top and 1 at the foot", () => {
    expect(scrollProgress(0, 2000, 800)).toBe(0);
    expect(scrollProgress(1200, 2000, 800)).toBe(1);
  });

  it("guards against a zero scrollable range", () => {
    expect(scrollProgress(0, 800, 800)).toBe(0);
  });
});
