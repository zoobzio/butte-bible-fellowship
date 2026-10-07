import { describe, expect, it } from "vitest";

import { emailHref, phoneHref } from "~/utils/contact";

describe("phoneHref", () => {
  it("calls a number by its digits alone", () => {
    expect(phoneHref("530-892-0521")).toBe("tel:5308920521");
    expect(phoneHref("(530) 892 0521")).toBe("tel:5308920521");
  });
});

describe("emailHref", () => {
  it("writes to the address", () => {
    expect(emailHref("office@example.org")).toBe("mailto:office@example.org");
  });
});
