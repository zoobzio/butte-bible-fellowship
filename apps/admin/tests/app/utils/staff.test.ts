import { describe, expect, it } from "vitest";

import { initials } from "~/utils/staff";

describe("initials", () => {
  it("is the first letter of the first name and of the last", () => {
    expect(initials("Jane Doe")).toBe("JD");
    expect(initials("jane van der doe")).toBe("JD");
  });

  it("is one letter for one name, and nothing for none", () => {
    expect(initials("  Jane ")).toBe("J");
    expect(initials("")).toBe("");
  });
});
