import { describe, expect, it } from "vitest";

import { initials } from "~/utils/people";

describe("initials", () => {
  it("is the first letter of the first name and of the last", () => {
    expect(initials("Jane", "Doe")).toBe("JD");
    expect(initials(" jane ann ", " van der doe")).toBe("JV");
  });

  it("is one letter for one name, and nothing for none", () => {
    expect(initials("  Jane ", "")).toBe("J");
    expect(initials("", "Doe")).toBe("D");
    expect(initials("", "  ")).toBe("");
  });
});
