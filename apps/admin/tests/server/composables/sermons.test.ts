import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useSermons } from "~~/server/composables/sermons";

const row = (id: number, date: string) => ({
  id,
  slug: `sermon-${id}`,
  title: `Sermon ${id}`,
  speaker: null,
  summary: null,
  body: null,
  image: null,
  video: `video${id}`,
  date,
  status: "draft" as "draft" | "published" | "archived",
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
});

const record = (id: number, date: string) => ({
  id,
  slug: `sermon-${id}`,
  title: `Sermon ${id}`,
  video: `video${id}`,
  date,
  status: "draft",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
});

/* The sermons, the latest first, as the query orders them. */
const ROWS = [
  row(4, "2026-10-11"),
  row(3, "2026-10-04"),
  row(2, "2026-10-04"),
  row(1, "2026-09-27"),
];

const held = { version: "7" };

const mark = vi.fn(async (_: { surface: string }) => ({
  version: held.version,
}));

const batch = vi.fn(
  async ({
    after_date,
    after_id,
    size,
  }: {
    after_date: string | null;
    after_id: number | null;
    size: number;
  }) =>
    ROWS.filter(
      (sermon) =>
        after_date === null ||
        after_id === null ||
        sermon.date < after_date ||
        (sermon.date === after_date && sermon.id < after_id),
    ).slice(0, size),
);

/* Every part of the search left out: null. */
const NONE = Object.fromEntries(
  [
    "q",
    "status_is",
    "status_not",
    ...["title", "speaker", "summary"].flatMap((column) =>
      ["contains", "not_contains", "starts_with", "ends_with", "is", "not"].map(
        (operator) => `${column}_${operator}`,
      ),
    ),
    ...["before", "after", "on", "on_or_after", "on_or_before"].map(
      (operator) => `date_${operator}`,
    ),
  ].map((name) => [name, null]),
);

const imported = vi.fn(async ({ entries }: { entries: string }) =>
  (JSON.parse(entries) as { video: string; slug: string }[])
    .filter(({ video }) => video !== "video4")
    .map(({ video, slug }, index) => ({ id: 10 + index, slug, video })),
);

const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3 ? { ...ROWS[1]!, body: "## James 2\n\nWhat faith does." } : null,
);

Object.assign(service, {
  admin: {
    changes: { fetch: { first: mark } },
    sermons: {
      batch,
      import: imported,
      fetch: { first: fetched },
    },
  },
});

afterEach(() => {
  held.version = "7";
  for (const query of [mark, batch, imported, fetched]) {
    query.mockClear();
  }
});

describe("useSermons", () => {
  it("reads the first batch with the mark the sermons stand at, and the cursor of the batch after it", async () => {
    expect(await useSermons().batch({ limit: 2 })).toEqual({
      items: [record(4, "2026-10-11"), record(3, "2026-10-04")],
      cursor: "2026-10-04.3",
      since: "7",
    });
    expect(mark).toHaveBeenCalledWith({ surface: "sermons" });
    // One more than asked, to tell whether a batch follows.
    expect(batch).toHaveBeenCalledWith({
      ...NONE,
      after_date: null,
      after_id: null,
      size: 3,
    });
  });

  it("reads the batch after a cursor, and ends with no cursor at the last", async () => {
    expect(
      await useSermons().batch({ limit: 2, cursor: "2026-10-04.3" }),
    ).toEqual({
      items: [record(2, "2026-10-04"), record(1, "2026-09-27")],
      cursor: null,
      since: "7",
    });
    expect(batch).toHaveBeenCalledWith({
      ...NONE,
      after_date: "2026-10-04",
      after_id: 3,
      size: 3,
    });
    expect(
      await useSermons().batch({ limit: 2, cursor: "2026-09-27.1" }),
    ).toEqual({ items: [], cursor: null, since: "7" });
  });

  it("hands the search on as the query names each part of it, and an empty text as none", async () => {
    await useSermons().batch({
      limit: 2,
      q: "faith",
      statusIs: "draft",
      statusNot: "archived",
      titleStartsWith: "Faith",
      speakerIs: "missing",
      summaryNotContains: "James",
      dateOnOrAfter: "2026-10-01",
    });
    expect(batch).toHaveBeenLastCalledWith({
      ...NONE,
      after_date: null,
      after_id: null,
      size: 3,
      q: "faith",
      status_is: "draft",
      status_not: "archived",
      title_starts_with: "Faith",
      speaker_is: "missing",
      summary_not_contains: "James",
      date_on_or_after: "2026-10-01",
    });
    await useSermons().batch({ limit: 2, q: "" });
    expect(batch).toHaveBeenLastCalledWith({
      ...NONE,
      after_date: null,
      after_id: null,
      size: 3,
    });
  });

  it("answers nothing where the sermons stand at the mark asked with, and reads none", async () => {
    expect(await useSermons().batch({ limit: 2, since: "7" })).toBeNull();
    expect(batch).not.toHaveBeenCalled();
    held.version = "8";
    expect(await useSermons().batch({ limit: 2, since: "7" })).toMatchObject({
      since: "8",
    });
  });

  it("reads a list with no count kept as standing at nothing", async () => {
    mark.mockResolvedValueOnce(null as never);
    expect(await useSermons().batch({ limit: 4 })).toMatchObject({
      since: "0",
    });
  });

  it("takes in the recordings of a feed, each preached the Sunday it was published on or before, and counts the ones added", async () => {
    const videos = [
      {
        video: "video9",
        title: "Faith & Works - Pastor Name",
        description: "James 2.\n\nJoin us.",
        // A Wednesday morning in the church's own time.
        published: "2026-10-07T18:00:00+00:00",
      },
      {
        video: "video4",
        title: "Sermon 4",
        published: "2026-10-11T19:00:00+00:00",
      },
    ];
    expect(await useSermons().sync(videos)).toEqual({ found: 2, added: 1 });
    // As JSON written out, which is how the query reads them.
    const [{ entries }] = imported.mock.calls[0]!;
    expect(entries).toBeTypeOf("string");
    expect(JSON.parse(entries)).toEqual([
      {
        video: "video9",
        title: "Faith & Works",
        speaker: "Pastor Name",
        summary: "James 2.",
        date: "2026-10-04",
        slug: "faith-works",
        fallback: "faith-works-video9",
      },
      {
        video: "video4",
        title: "Sermon 4",
        speaker: null,
        summary: null,
        date: "2026-10-11",
        slug: "sermon-4",
        fallback: "sermon-4-video4",
      },
    ]);
  });

  it("writes nothing for a feed that lists nothing", async () => {
    expect(await useSermons().sync([])).toEqual({ found: 0, added: 0 });
    expect(imported).not.toHaveBeenCalled();
  });

  it("reads a sermon whole, what is written about it as it was written, and nothing where there is none", async () => {
    expect(await useSermons().fetch(3)).toEqual({
      ...record(3, "2026-10-04"),
      body: "## James 2\n\nWhat faith does.",
    });
    expect(fetched).toHaveBeenCalledWith({ id: 3 });
    expect(await useSermons().fetch(99)).toBeNull();
  });
});
