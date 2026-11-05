import { describe, expect, it } from "vitest";

import { entries, keys } from "objectively";

import {
  DATE_DEFAULT_OPERATOR,
  DATE_OPERATORS,
  MATCH_DEFAULT_OPERATOR,
  MATCH_OPERATORS,
  TEXT_DEFAULT_OPERATOR,
  TEXT_OPERATORS,
} from "../../src/input/operators";

/** An operator's words run together, each capitalised. */
const capitalised = (operator: string) =>
  operator
    .split(" ")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join("");

describe("the operators", () => {
  it("are the words the search offers, a bare value taking the default of each kind", () => {
    expect(keys(TEXT_OPERATORS)).toEqual([
      "contains",
      "not contains",
      "starts with",
      "ends with",
      "is",
      "not",
    ]);
    expect(keys(TEXT_OPERATORS)).toContain(TEXT_DEFAULT_OPERATOR);
    expect(keys(DATE_OPERATORS)).toEqual([
      "before",
      "after",
      "on",
      "on or after",
      "on or before",
    ]);
    expect(keys(DATE_OPERATORS)).toContain(DATE_DEFAULT_OPERATOR);
    expect(keys(MATCH_OPERATORS)).toEqual(["is", "not"]);
    expect(keys(MATCH_OPERATORS)).toContain(MATCH_DEFAULT_OPERATOR);
  });

  it("carry each word's suffix for a query key: the words run together, each capitalised", () => {
    for (const [operator, suffix] of [
      ...entries(TEXT_OPERATORS),
      ...entries(DATE_OPERATORS),
      ...entries(MATCH_OPERATORS),
    ]) {
      expect(suffix).toBe(capitalised(operator));
    }
  });

  it("spell a word the same wherever two kinds share it", () => {
    expect(MATCH_OPERATORS.is).toBe(TEXT_OPERATORS.is);
    expect(MATCH_OPERATORS.not).toBe(TEXT_OPERATORS.not);
  });
});
