import { describe, expect, it } from "vitest";

import { isWithin } from "~/utils/navigation";

describe("isWithin", () => {
  it("is true of a page and the pages under it", () => {
    expect(isWithin("/staff", "/staff")).toBe(true);
    expect(isWithin("/staff/3", "/staff")).toBe(true);
    expect(isWithin("/staff/new", "/staff")).toBe(true);
  });

  it("is false of another page, however it is spelled", () => {
    expect(isWithin("/events", "/staff")).toBe(false);
    expect(isWithin("/staffing", "/staff")).toBe(false);
    expect(isWithin("/", "/staff")).toBe(false);
  });
});
