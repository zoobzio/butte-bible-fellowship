import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useDocuments } from "~~/server/composables/documents";

const ROW = {
  slug: "worship-service",
  title: "Worship Service",
  summary: "We gather on Sunday morning.",
  image: "https://cdn.example.com/events/worship-service.jpg",
  date: "2026-01-04",
  recurring: true,
  weeks: null,
  start_time: "10:00:00",
  end_time: "11:30:00",
};

const PARAGRAPH = {
  type: "element",
  tagName: "p",
  properties: {},
  children: [{ type: "text", value: "We gather." }],
};

const BARE = {
  ...ROW,
  slug: "prayer-meeting",
  title: "Prayer Meeting",
  summary: null,
  image: null,
  body: null,
};

const list = vi.fn(async (_args: { from: string }) => [ROW, BARE]);
const first = vi.fn(async (args: { slug: string }) => {
  if (args.slug === ROW.slug) {
    return { ...ROW, body: { type: "root", children: [PARAGRAPH] } };
  }
  return args.slug === BARE.slug ? BARE : null;
});

Object.assign(service, {
  web: { events: { list, fetch: { first } } },
});

afterEach(() => {
  list.mockClear();
  first.mockClear();
});

describe("useDocuments", () => {
  it("lists a document for every event the site lists", async () => {
    expect(await useDocuments().list()).toEqual([
      "events/worship-service.json",
      "events/prayer-meeting.json",
    ]);
  });

  it("answers an event's page as a document: its body under its front matter", async () => {
    expect(await useDocuments().get("events/worship-service.json")).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Worship Service",
          description: "We gather on Sunday morning.",
          image: "https://cdn.example.com/events/worship-service.jpg",
        },
      },
      children: [PARAGRAPH],
    });
    expect(first).toHaveBeenCalledWith({ slug: "worship-service" });
  });

  it("answers an event nothing is written about as an empty document", async () => {
    expect(await useDocuments().get("events/prayer-meeting.json")).toEqual({
      type: "root",
      data: { matter: { title: "Prayer Meeting" } },
      children: [],
    });
  });

  it("answers nothing for an event the database does not hold", async () => {
    expect(await useDocuments().get("events/nope.json")).toBeUndefined();
  });

  it("answers nothing for a path that is not an event's page", async () => {
    for (const path of [
      "about-us.json",
      "events.json",
      "events/a/b.json",
      "events/Not A Slug.json",
      "events/worship-service.md",
    ]) {
      expect(await useDocuments().get(path)).toBeUndefined();
    }
    expect(first).not.toHaveBeenCalled();
  });
});
