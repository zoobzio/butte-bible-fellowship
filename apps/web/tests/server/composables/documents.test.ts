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

const HEADING = {
  type: "element",
  tagName: "h1",
  properties: {},
  children: [{ type: "text", value: "Our Vision" }],
};

const PAGES: Record<string, object> = {
  "about-us": {
    slug: "about-us",
    title: "About Us – Test Church",
    description: "Who we are.",
    body: { type: "root", children: [HEADING] },
  },
  index: {
    slug: "index",
    title: "Test Church",
    description: null,
    body: null,
  },
};

const pages = vi.fn(async () => Object.keys(PAGES).map((slug) => ({ slug })));
const page = vi.fn(async (args: { slug: string }) => PAGES[args.slug] ?? null);

const list = vi.fn(async (_args: { from: string }) => [ROW, BARE]);
const first = vi.fn(async (args: { slug: string }) => {
  if (args.slug === ROW.slug) {
    return { ...ROW, body: { type: "root", children: [PARAGRAPH] } };
  }
  return args.slug === BARE.slug ? BARE : null;
});

Object.assign(service, {
  web: {
    content: { list: pages, fetch: { first: page } },
    events: { list, fetch: { first } },
  },
});

afterEach(() => {
  pages.mockClear();
  page.mockClear();
  list.mockClear();
  first.mockClear();
});

describe("useDocuments", () => {
  it("lists a document for every page, and for every event the site lists", async () => {
    expect(await useDocuments().list()).toEqual([
      "about-us.json",
      "index.json",
      "events/worship-service.json",
      "events/prayer-meeting.json",
    ]);
  });

  it("answers a page as a document: what is written on it under its front matter, its headings with ids", async () => {
    expect(await useDocuments().get("about-us.json")).toEqual({
      type: "root",
      data: {
        matter: { title: "About Us – Test Church", description: "Who we are." },
      },
      children: [{ ...HEADING, properties: { id: "our-vision" } }],
    });
    expect(page).toHaveBeenCalledWith({ slug: "about-us" });
    expect(first).not.toHaveBeenCalled();
  });

  it("answers the home page as index, with no hero: that is the interface's own", async () => {
    expect(await useDocuments().get("index.json")).toEqual({
      type: "root",
      data: { matter: { title: "Test Church" } },
      children: [],
    });
    expect(list).not.toHaveBeenCalled();
  });

  it("answers nothing for the pages whose words are the interface's: they are no content", async () => {
    for (const path of ["events.json", "sermons.json", "connect.json"]) {
      expect(await useDocuments().get(path), path).toBeUndefined();
    }
    expect(list).not.toHaveBeenCalled();
  });

  it("answers nothing for a page the database does not hold", async () => {
    expect(await useDocuments().get("nope.json")).toBeUndefined();
    expect(page).toHaveBeenCalledWith({ slug: "nope" });
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

  it("answers nothing for a path that is neither a page nor an event's", async () => {
    for (const path of [
      "about-us.md",
      "About Us.json",
      "pages/about-us.json",
      "events/a/b.json",
      "events/Not A Slug.json",
      "events/worship-service.md",
    ]) {
      expect(await useDocuments().get(path)).toBeUndefined();
    }
    expect(first).not.toHaveBeenCalled();
    expect(page).not.toHaveBeenCalled();
  });
});
