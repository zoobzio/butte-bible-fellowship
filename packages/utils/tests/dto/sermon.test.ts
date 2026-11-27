import { sermon, sermonDetail, sermonRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toSermon, toSermonDetail, toSermonRecord } from "../../src/dto/sermon";

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

describe("toSermonRecord", () => {
  const RECORD_ROW = {
    ...ROW,
    id: 12,
    status: "draft" as const,
    created_at: new Date("2026-10-17T18:00:00Z"),
    updated_at: new Date("2026-10-18T09:30:00Z"),
  };

  it("builds a sermon as the admin lists it, with whether it reaches the site", () => {
    const record = toSermonRecord(RECORD_ROW);
    expect(record).toEqual({
      id: 12,
      slug: "faith-and-works",
      title: "Faith & Works",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
      status: "draft",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
    expect(sermonRecord.parse(record)).toEqual(record);
  });

  it("carries what else the row has", () => {
    expect(
      toSermonRecord({
        ...RECORD_ROW,
        speaker: "Pastor Name",
        summary: "James 2.",
        image: "https://cdn.example.com/sermons/faith-and-works.jpg",
        video: null,
      }),
    ).toMatchObject({
      speaker: "Pastor Name",
      summary: "James 2.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: undefined,
    });
  });
});

describe("toSermonDetail", () => {
  const row = {
    ...ROW,
    id: 7,
    body: "## James 2\n\nWhat faith does.",
    status: "published" as const,
    created_at: new Date("2026-10-17T18:00:00.000Z"),
    updated_at: new Date("2026-10-18T09:30:00.000Z"),
  };

  it("builds a sermon as the admin reads it on its own page, what is written about it as it was written", () => {
    const detail = toSermonDetail(row);
    expect(detail).toEqual({
      ...toSermonRecord(row),
      body: "## James 2\n\nWhat faith does.",
    });
    expect(sermonDetail.parse(detail)).toEqual(detail);
  });

  it("leaves out what is written about a sermon with nothing written", () => {
    expect(toSermonDetail({ ...row, body: null }).body).toBeUndefined();
  });
});
