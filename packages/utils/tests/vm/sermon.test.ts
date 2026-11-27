import type { SermonRecord } from "@bbf/schema/types";

import { sermonForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toSermonForm } from "../../src/vm/sermon";

const RECORD: SermonRecord = {
  id: 12,
  slug: "faith-and-works",
  title: "Faith & Works",
  speaker: "Pastor Name",
  summary: "James 2, and what faith does.",
  image: "https://cdn.example.com/sermons/faith-and-works.jpg",
  video: "dQw4w9WgXcQ",
  date: "2026-10-04",
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toSermonForm", () => {
  it("holds a sermon's details as the form does, field for field, and not its row's own", () => {
    const form = toSermonForm(RECORD);
    expect(form).toEqual({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: "dQw4w9WgXcQ",
      date: "2026-10-04",
      status: "published",
    });
    expect(sermonForm.parse(form)).toEqual(form);
  });

  it("leaves empty what the sermon has none of", () => {
    const { speaker, summary, image, video, ...bare } = RECORD;
    expect(toSermonForm(bare)).toMatchObject({
      speaker: undefined,
      summary: undefined,
      image: undefined,
      video: undefined,
    });
  });
});
