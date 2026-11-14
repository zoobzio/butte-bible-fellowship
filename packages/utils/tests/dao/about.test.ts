import { aboutBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toAboutArguments } from "../../src/dao/about";

describe("toAboutArguments", () => {
  it("writes a description left out as null", () => {
    expect(toAboutArguments(aboutBody.parse({ title: "About Us" }))).toEqual({
      title: "About Us",
      description: null,
    });
  });

  it("carries every field a body says", () => {
    const body = aboutBody.parse({
      title: "About Us",
      description: "A clean canvas.",
    });
    expect(toAboutArguments(body)).toEqual(body);
  });
});
