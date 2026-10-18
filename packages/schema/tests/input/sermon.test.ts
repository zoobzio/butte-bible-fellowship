import { describe, expect, it } from "vitest";

import {
  SERMONS_LIMIT,
  sermonPath,
  sermonsQuery,
} from "../../src/input/sermon";

describe("sermonPath", () => {
  it("names a sermon by YouTube's id for it", () => {
    expect(sermonPath.parse({ id: "abc123" })).toEqual({ id: "abc123" });
    expect(sermonPath.safeParse({ id: "" }).success).toBe(false);
  });
});

describe("sermonsQuery", () => {
  it("takes fifteen when not told how many", () => {
    expect(sermonsQuery.parse({})).toEqual({ limit: 15 });
  });

  it("reads the limit from the query's string", () => {
    expect(sermonsQuery.parse({ limit: "3" })).toEqual({ limit: 3 });
  });

  it("rejects a limit that is not a whole number within reach", () => {
    expect(sermonsQuery.safeParse({ limit: "0" }).success).toBe(false);
    expect(sermonsQuery.safeParse({ limit: "2.5" }).success).toBe(false);
    expect(sermonsQuery.safeParse({ limit: "many" }).success).toBe(false);
    expect(
      sermonsQuery.safeParse({ limit: String(SERMONS_LIMIT + 1) }).success,
    ).toBe(false);
  });
});
