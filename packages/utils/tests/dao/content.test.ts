import { contentBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toContentArguments } from "../../src/dao/content";

describe("toContentArguments", () => {
  it("writes what a body leaves out as null", () => {
    const body = contentBody.parse({ slug: "index", title: "Home" });
    expect(toContentArguments(body)).toEqual({
      slug: "index",
      title: "Home",
      description: null,
    });
  });

  it("carries every field a body says", () => {
    const body = contentBody.parse({
      slug: "index",
      title: "Butte Bible Fellowship",
      description: "A local church.",
    });
    expect(toContentArguments(body)).toEqual({
      slug: "index",
      title: "Butte Bible Fellowship",
      description: "A local church.",
    });
  });
});
