import { contentBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import {
  toContentArguments,
  toContentDraftArguments,
} from "../../src/dao/content";

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

describe("toContentDraftArguments", () => {
  it("is the metadata, and the folder the page is made in", () => {
    const body = contentBody.parse({ slug: "news", title: "News" });
    expect(toContentDraftArguments(body, 3)).toEqual({
      slug: "news",
      title: "News",
      description: null,
      folder_id: 3,
    });
  });

  it("writes no folder as null: the page is made at the top", () => {
    const body = contentBody.parse({ slug: "news", title: "News" });
    expect(toContentDraftArguments(body).folder_id).toBeNull();
  });
});
