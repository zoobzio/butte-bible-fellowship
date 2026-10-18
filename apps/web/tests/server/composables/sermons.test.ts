import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "#test/mocks/bezoar";
import { useSermons } from "~~/server/composables/sermons";

/** A row as `web.sermons.list` returns it: no body. */
const LISTED = {
  slug: "faith-and-works",
  title: "Faith & Works",
  speaker: null,
  summary: "James 2, and what faith does.",
  image: null,
  video: "abc123",
  date: "2026-10-04",
};

/** A row as `web.sermons.fetch` returns it: the body with it. */
const PAGE = { ...LISTED, body: "What faith does." };

const list = vi.fn(async (_args: { limit: number }) => [
  LISTED,
  { ...LISTED, slug: "unrecorded", video: null, date: "2026-09-27" },
]);
const first = vi.fn(async (args: { slug: string }) =>
  args.slug === PAGE.slug ? PAGE : null,
);

// The service is the stub the module's shim keeps; the sermons queries are
// given to it here, the shape the built service has them in.
Object.assign(service, { web: { sermons: { list, fetch: { first } } } });

afterEach(() => {
  list.mockClear();
  first.mockClear();
});

describe("useSermons", () => {
  it("lists the sermons as the API serves them, as many as asked", async () => {
    expect(await useSermons().list(3)).toEqual([
      {
        slug: "faith-and-works",
        title: "Faith & Works",
        summary: "James 2, and what faith does.",
        video: "abc123",
        date: "2026-10-04",
      },
      {
        slug: "unrecorded",
        title: "Faith & Works",
        summary: "James 2, and what faith does.",
        date: "2026-09-27",
      },
    ]);
    expect(list).toHaveBeenCalledWith({ limit: 3 });
  });

  it("fetches one sermon by slug, its body as the tree, or nothing", async () => {
    expect(await useSermons().fetch("faith-and-works")).toMatchObject({
      slug: "faith-and-works",
      body: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: "What faith does." }],
          },
        ],
      },
    });
    expect(first).toHaveBeenCalledWith({ slug: "faith-and-works" });
    expect(await useSermons().fetch("nope")).toBeNull();
  });
});
