import type { AboutRecord } from "@bbf/schema/types";

import { aboutBody, aboutForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toAboutBody, toAboutForm } from "../../src/vm/about";

const METADATA = { title: "About Us", description: "A clean canvas." };

const ABOUT: AboutRecord = {
  ...METADATA,
  body: { type: "root", children: [] },
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toAboutForm", () => {
  it("is the record's metadata as the form holds it, and nothing of what is written on it", () => {
    const form = toAboutForm(ABOUT);
    expect(form).toEqual(METADATA);
    expect(aboutForm.safeParse(form).success).toBe(true);
  });

  it("leaves the description empty for a page without one", () => {
    expect(
      toAboutForm({ title: "About Us", updatedAt: ABOUT.updatedAt }),
    ).toEqual({ title: "About Us", description: undefined });
  });
});

describe("toAboutBody", () => {
  it("is the form as a body writes it: the record's metadata, back again", () => {
    const body = toAboutBody(toAboutForm(ABOUT));
    expect(body).toEqual(METADATA);
    expect(aboutBody.parse(body)).toEqual(body);
  });

  it("trims what is written, and leaves out what is left empty", () => {
    expect(toAboutBody({ title: "  About Us ", description: "   " })).toEqual({
      title: "About Us",
      description: undefined,
    });
  });
});
