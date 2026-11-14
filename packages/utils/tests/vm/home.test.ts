import type { HomeRecord } from "@bbf/schema/types";

import { homeBody, homeForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toHomeBody, toHomeForm } from "../../src/vm/home";

const HEADING = "Discover God’s **Love, Grace & Truth**";

const WORDS = {
  title: "Butte Bible Fellowship",
  description: "A local church.",
  heroDescription: "Join us.",
  heroAction: "Learn More",
  heroLink: "/about-us",
};

const HOME: HomeRecord = {
  ...WORDS,
  heroHeading: HEADING,
  heroImage: "https://cdn.example.com/home/1.jpg",
  body: { type: "root", children: [] },
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toHomeForm", () => {
  it("is the record's metadata as the form holds it, and neither its picture nor what is written on it", () => {
    const form = toHomeForm(HOME);
    expect(form).toEqual({ ...WORDS, heroHeading: HEADING });
    expect(homeForm.safeParse(form).success).toBe(true);
  });

  it("leaves the description empty for a page without one", () => {
    const { description: _, ...bare } = HOME;
    expect(toHomeForm(bare).description).toBeUndefined();
  });
});

describe("toHomeBody", () => {
  it("is the form as a body writes it: the record's metadata, back again", () => {
    const body = toHomeBody(toHomeForm(HOME));
    expect(body).toEqual({ ...WORDS, heroHeading: HEADING });
    expect(homeBody.parse(body)).toEqual(body);
  });

  it("trims what is written, and leaves out a description left empty", () => {
    expect(
      toHomeBody({
        title: "  Butte Bible Fellowship ",
        description: "   ",
        heroHeading: ` ${HEADING} `,
        heroDescription: " Join us. ",
        heroAction: " Learn More ",
        heroLink: " /about-us ",
      }),
    ).toEqual({ ...WORDS, description: undefined, heroHeading: HEADING });
  });
});
