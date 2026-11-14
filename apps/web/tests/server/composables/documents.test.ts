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
  membership: {
    slug: "membership",
    title: "Membership – Test Church",
    description: "How to join.",
    body: { type: "root", children: [HEADING] },
  },
  // A page written in the admin under the home page's name: never served.
  index: {
    slug: "index",
    title: "Not the home page",
    description: null,
    body: null,
  },
};

const HOME = {
  title: "Test Church",
  description: null,
  hero_heading: "Discover **Love**",
  hero_description: "Join us.",
  hero_action: "Learn More",
  hero_link: "/about-us",
  hero_image: null,
  body: null,
};

const ABOUT = {
  title: "About Us",
  description: "A clean canvas.",
  body: { type: "root", children: [HEADING] },
};

const CONNECT = {
  title: "Connect",
  description: null,
  address: "1 Test Street, Testville",
  phone: "555-010-0100",
  fax: null,
  email: null,
  hours: "Friday: 9am–noon",
  body: null,
};

const pages = vi.fn(async () => Object.keys(PAGES).map((slug) => ({ slug })));
const page = vi.fn(async (args: { slug: string }) => PAGES[args.slug] ?? null);
const home = vi.fn(async (): Promise<object | null> => HOME);
const about = vi.fn(async (): Promise<object | null> => ABOUT);
const connect = vi.fn(async (): Promise<object | null> => CONNECT);

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
    home: { fetch: { first: home } },
    about: { fetch: { first: about } },
    connect: { fetch: { first: connect } },
    events: { list, fetch: { first } },
  },
});

afterEach(() => {
  pages.mockClear();
  page.mockClear();
  home.mockClear();
  about.mockClear();
  connect.mockClear();
  list.mockClear();
  first.mockClear();
});

describe("useDocuments", () => {
  it("lists a document for each page with a table of its own, for every page written in the admin, and for every event the site lists", async () => {
    expect(await useDocuments().list()).toEqual([
      "index.json",
      "about-us.json",
      "connect.json",
      "membership.json",
      "events/worship-service.json",
      "events/prayer-meeting.json",
    ]);
  });

  it("answers a page written in the admin as a document: what is written on it under its front matter, its headings with ids", async () => {
    expect(await useDocuments().get("membership.json")).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Membership – Test Church",
          description: "How to join.",
        },
      },
      children: [{ ...HEADING, properties: { id: "our-vision" } }],
    });
    expect(page).toHaveBeenCalledWith({ slug: "membership" });
    expect(first).not.toHaveBeenCalled();
    expect(home).not.toHaveBeenCalled();
  });

  it("answers the home page as index, from its own table, its hero in its front matter", async () => {
    expect(await useDocuments().get("index.json")).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Test Church",
          hero: {
            heading: "Discover **Love**",
            description: "Join us.",
            action: "Learn More",
            link: "/about-us",
          },
        },
      },
      children: [],
    });
    expect(page).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
  });

  it("answers About Us from its own table, the title and description it opens with as its front matter", async () => {
    expect(await useDocuments().get("about-us.json")).toEqual({
      type: "root",
      data: {
        matter: { title: "About Us", description: "A clean canvas." },
      },
      children: [{ ...HEADING, properties: { id: "our-vision" } }],
    });
    expect(page).not.toHaveBeenCalled();
  });

  it("answers nothing for a page whose table holds no row", async () => {
    home.mockResolvedValueOnce(null);
    about.mockResolvedValueOnce(null);
    expect(await useDocuments().get("index.json")).toBeUndefined();
    expect(await useDocuments().get("about-us.json")).toBeUndefined();
    expect(page).not.toHaveBeenCalled();
  });

  it("answers nothing for the pages whose words are the interface's: they are no content", async () => {
    for (const path of ["events.json", "sermons.json"]) {
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

  it("answers the connect page from its own table, how to reach the church in its front matter", async () => {
    expect(await useDocuments().get("connect.json")).toEqual({
      type: "root",
      data: {
        matter: {
          title: "Connect",
          address: "1 Test Street, Testville",
          phone: "555-010-0100",
          hours: "Friday: 9am–noon",
        },
      },
      children: [],
    });
    expect(page).not.toHaveBeenCalled();
    connect.mockResolvedValueOnce(null);
    expect(await useDocuments().get("connect.json")).toBeUndefined();
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
      "membership.md",
      "About Us.json",
      "pages/membership.json",
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
