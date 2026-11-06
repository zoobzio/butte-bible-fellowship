import { describe, expect, it } from "vitest";

import { isWithin } from "#layers/bbf/app/utils/navigation";

describe("isWithin", () => {
  it("holds a section's own page and the pages under it", () => {
    expect(isWithin("/events", "/events")).toBe(true);
    expect(isWithin("/events/potluck", "/events")).toBe(true);
    expect(isWithin("/staff/new", "/staff")).toBe(true);
  });

  it("leaves out a page that only starts as the section does", () => {
    expect(isWithin("/events-archive", "/events")).toBe(false);
    expect(isWithin("/staffing", "/staff")).toBe(false);
    expect(isWithin("/connect", "/events")).toBe(false);
  });

  it("holds the home page alone within the root", () => {
    expect(isWithin("/", "/")).toBe(true);
    expect(isWithin("/events", "/")).toBe(false);
    expect(isWithin("/", "/staff")).toBe(false);
  });
});
