import { describe, expect, it } from "vitest";

import { headingParts } from "~/utils/hero";

describe("headingParts", () => {
  it("marks what stands between two pairs of asterisks as the highlight, and drops the asterisks", () => {
    expect(headingParts("Discover God’s **Love, Grace & Truth**")).toEqual([
      { text: "Discover God’s ", highlight: false },
      { text: "Love, Grace & Truth", highlight: true },
    ]);
  });

  it("takes a highlight anywhere in the line, and more than one", () => {
    expect(headingParts("**Come** and **see** us")).toEqual([
      { text: "Come", highlight: true },
      { text: " and ", highlight: false },
      { text: "see", highlight: true },
      { text: " us", highlight: false },
    ]);
  });

  it("is one part for a heading with no highlight, and none for no heading", () => {
    expect(headingParts("Come and see")).toEqual([
      { text: "Come and see", highlight: false },
    ]);
    expect(headingParts("")).toEqual([]);
  });

  it("leaves asterisks that mark nothing as they are written", () => {
    expect(headingParts("5 * 5 and **open")).toEqual([
      { text: "5 * 5 and **open", highlight: false },
    ]);
  });
});
