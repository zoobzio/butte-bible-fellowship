import { sermon } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toSermon } from "../../src/dto/sermon";

/** A row as `web.sermons.list` returns it: no `body` column at all. */
const ROW = {
  slug: "faith-and-works",
  title: "Faith & Works",
  speaker: null,
  summary: null,
  image: null,
  video: "dQw4w9WgXcQ",
  date: "2026-10-04",
};

describe("toSermon", () => {
  it("builds a sermon, leaving out what the row has null in", () => {
    expect(toSermon(ROW)).toEqual({
      slug: "faith-and-works",
      title: "Faith & Works",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
    });
  });

  it("carries what else the row has", () => {
    expect(
      toSermon({
        ...ROW,
        speaker: "Pastor Name",
        summary: "James 2, and what faith does.",
        image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      }),
    ).toMatchObject({
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
    });
  });

  it("leaves out the video of a sermon not recorded", () => {
    expect(toSermon({ ...ROW, video: null }).video).toBeUndefined();
  });

  it("serves the body as the tree the app renders, not the Markdown", () => {
    const served = toSermon({ ...ROW, body: "## James 2\n\nWhat faith does." });
    expect(served.body).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "james-2" },
          children: [{ type: "text", value: "James 2" }],
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "What faith does." }],
        },
      ],
    });
    expect(sermon.safeParse(served).success).toBe(true);
    expect(toSermon({ ...ROW, body: null }).body).toBeUndefined();
  });

  it("takes an admin row, whose extra columns go nowhere", () => {
    const row = {
      ...ROW,
      id: 7,
      body: null,
      status: "published" as const,
      created_at: new Date(),
      updated_at: new Date(),
    };
    expect(toSermon(row)).not.toHaveProperty("id");
    expect(toSermon(row)).not.toHaveProperty("status");
    expect(toSermon(row)).not.toHaveProperty("created_at");
  });

  it("builds what the schema accepts", () => {
    expect(sermon.safeParse(toSermon(ROW)).success).toBe(true);
  });
});
