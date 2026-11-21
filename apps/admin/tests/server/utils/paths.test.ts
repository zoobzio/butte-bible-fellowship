import { describe, expect, it } from "vitest";

import { toLocation } from "~~/server/utils/paths";

describe("toLocation", () => {
  it("is the top, the path of no steps, for no address", () => {
    expect(toLocation(undefined)).toEqual([]);
    expect(toLocation("")).toEqual([]);
  });

  it("reads the steps between the slashes, each decoded on its own", () => {
    expect(toLocation("about-us")).toEqual(["about-us"]);
    expect(toLocation("Sermon%20notes/Romans")).toEqual([
      "Sermon notes",
      "Romans",
    ]);
    expect(toLocation("Q%26A/one%2C%20two")).toEqual(["Q&A", "one, two"]);
  });

  it("drops the steps that hold nothing", () => {
    expect(toLocation("/Sermon%20notes//Romans/")).toEqual([
      "Sermon notes",
      "Romans",
    ]);
    expect(toLocation("/")).toEqual([]);
  });

  it("is none where a name is not encoded as part of an address", () => {
    expect(toLocation("%E0%A4%A")).toBeUndefined();
    expect(toLocation("Romans/%")).toBeUndefined();
  });

  it("is none where a name stands as no step of a path", () => {
    expect(toLocation(".")).toBeUndefined();
    expect(toLocation("Romans/..")).toBeUndefined();
    expect(toLocation("a%2Fb")).toBeUndefined();
    // A dot is no more than a letter anywhere else in a name.
    expect(toLocation("v1.2/...")).toEqual(["v1.2", "..."]);
  });
});
