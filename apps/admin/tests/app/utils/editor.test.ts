import { describe, expect, it } from "vitest";

import { ROLE_OPTIONS, STATUS_OPTIONS } from "~/constants/editor";
import { toOptions } from "~/utils/editor";

describe("toOptions", () => {
  it("names each choice for the reader, in the order offered", () => {
    expect(toOptions(ROLE_OPTIONS, (message) => `[${message}]`)).toEqual([
      { value: "pastor", label: "[roles.pastor]" },
      { value: "elder", label: "[roles.elder]" },
      { value: "staff", label: "[roles.staff]" },
    ]);
    expect(
      toOptions(STATUS_OPTIONS, (message) => message).map((o) => o.value),
    ).toEqual(["draft", "published", "archived"]);
  });
});
