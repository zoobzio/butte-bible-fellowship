import { sermonBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toSermonArguments } from "../../src/dao/sermon";

describe("toSermonArguments", () => {
  it("writes what a body leaves out as null, a draft", () => {
    const body = sermonBody.parse({
      slug: "faith-and-works",
      title: "Faith & Works",
      date: "2026-10-04",
    });
    expect(toSermonArguments(body)).toEqual({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: null,
      summary: null,
      body: null,
      image: null,
      video: null,
      date: "2026-10-04",
      status: "draft",
    });
  });

  it("carries every field a body says", () => {
    const body = sermonBody.parse({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      body: "## James 2\n\nWhat faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
      status: "published",
    });
    expect(toSermonArguments(body)).toEqual({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      body: "## James 2\n\nWhat faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
      status: "published",
    });
  });
});
