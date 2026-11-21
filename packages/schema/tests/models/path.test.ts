import { describe, expect, it } from "vitest";

import { contentLocation, isStep } from "../../src/models/path";

describe("isStep", () => {
  it("holds for a name that stands as one step of a path", () => {
    for (const name of [
      "Sermon notes",
      "about-us",
      "2026",
      "v1.2",
      "...",
      "Q&A: one, two + three!",
    ]) {
      expect(isStep(name), name).toBe(true);
    }
  });

  it("fails for nothing, a name that holds what an address reads as something else, and the two it reads as here and above", () => {
    for (const name of [
      "",
      "a/b",
      "/",
      "a\\b",
      "why?",
      "#1",
      "50%",
      ".",
      "..",
    ]) {
      expect(isStep(name), name).toBe(false);
    }
  });
});

describe("contentLocation", () => {
  it("is the names from the top down, and none at the top", () => {
    expect(contentLocation.parse([])).toEqual([]);
    expect(
      contentLocation.parse(["Sermon notes", "Romans", "chapter-1"]),
    ).toEqual(["Sermon notes", "Romans", "chapter-1"]);
  });

  it("keeps each name as it is written", () => {
    expect(contentLocation.parse([" Romans "])).toEqual([" Romans "]);
  });

  it("refuses what is no list of steps", () => {
    expect(contentLocation.safeParse("Sermon notes/Romans").success).toBe(
      false,
    );
    expect(contentLocation.safeParse([4]).success).toBe(false);
    for (const step of ["", "a/b", ".", ".."]) {
      expect(contentLocation.safeParse(["Romans", step]).success, step).toBe(
        false,
      );
    }
  });
});
