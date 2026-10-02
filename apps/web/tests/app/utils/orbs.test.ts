import { describe, expect, it } from "vitest";

import { ORB_TRAVEL } from "~/constants/orbs";
import { orbDrift } from "~/utils/orbs";

describe("orbDrift", () => {
  it("is zero at the top of the page", () => {
    expect(orbDrift(0)).toBe("0.0");
  });

  it("reaches the full travel at the foot of the page", () => {
    expect(orbDrift(1)).toBe(ORB_TRAVEL.toFixed(1));
  });

  it("scales with progress, to one decimal", () => {
    expect(orbDrift(0.5)).toBe((ORB_TRAVEL / 2).toFixed(1));
    expect(orbDrift(1 / 3)).toMatch(/^\d+\.\d$/);
  });
});
