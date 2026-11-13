import type { ContentRecord } from "@bbf/schema/types";

import { contentBody, contentForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toContentBody, toContentForm } from "../../src/vm/content";

const STAMPS = {
  id: 7,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const HOME: ContentRecord = {
  ...STAMPS,
  slug: "index",
  title: "Butte Bible Fellowship",
  description: "A local church.",
  body: { type: "root", children: [] },
};

const BARE: ContentRecord = { ...STAMPS, slug: "about-us", title: "About Us" };

describe("toContentForm", () => {
  it("is a record's metadata as the form holds it, and nothing of what is written on it", () => {
    const form = toContentForm(HOME);
    expect(form).toEqual({
      slug: "index",
      title: "Butte Bible Fellowship",
      description: "A local church.",
    });
    expect(contentForm.safeParse(form).success).toBe(true);
  });

  it("leaves the description empty for a page without one", () => {
    const form = toContentForm(BARE);
    expect(form).toEqual({
      slug: "about-us",
      title: "About Us",
      description: undefined,
    });
    expect(contentForm.safeParse(form).success).toBe(true);
  });
});

describe("toContentBody", () => {
  it("is the form as a body writes it: the record's metadata, back again", () => {
    const body = toContentBody(toContentForm(HOME));
    expect(body).toEqual({
      slug: "index",
      title: "Butte Bible Fellowship",
      description: "A local church.",
    });
    expect(contentBody.parse(body)).toEqual(body);
  });

  it("trims what is written, and leaves out what is left empty", () => {
    expect(
      toContentBody({
        slug: " about-us ",
        title: "  About Us ",
        description: "   ",
      }),
    ).toEqual({ slug: "about-us", title: "About Us", description: undefined });
  });
});
