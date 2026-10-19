import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "#test/mocks/bezoar";
import { useEvents } from "~~/server/composables/events";

/** A row as `admin.events.list` and `admin.events.fetch` return it. */
const ROW = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  note: null,
  summary: null,
  body: null,
  image: null,
  location: null,
  date: null,
  day: "sunday" as const,
  weeks: [1, 3],
  start_time: "10:00:00",
  end_time: "11:30:00",
  status: "published" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

/** The same, as the API serves it. */
const RECORD = {
  id: 3,
  slug: "worship-service",
  title: "Worship Service",
  day: "sunday",
  weeks: [1, 3],
  start: "10:00",
  end: "11:30",
  status: "published",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const list = vi.fn(async () => [ROW]);
const fetched = vi.fn(async ({ id }: { id: number }) =>
  id === 3 ? ROW : id === 5 ? { ...ROW, id: 5, slug: "new" } : null,
);
const created = vi.fn(async (args: { slug: string }) => ({
  id: 5,
  slug: args.slug,
  created_at: ROW.created_at,
}));
const updated = vi.fn(async (args: { id: number; slug: string }) =>
  args.id === 3 ? { id: 3, slug: args.slug, updated_at: ROW.updated_at } : null,
);
const deleted = vi.fn(async ({ id }: { id: number }) => (id === 3 ? 1 : 0));

Object.assign(service, {
  admin: {
    events: {
      list,
      fetch: { first: fetched },
      create: { first: created },
      update: { first: updated },
      delete: deleted,
    },
  },
});

afterEach(() => {
  for (const query of [list, fetched, created, updated, deleted]) {
    query.mockClear();
  }
});

describe("useEvents", () => {
  it("lists one page of the events as the API serves them", async () => {
    expect(await useEvents().list({ page: 1, size: 25 })).toEqual({
      items: [RECORD],
      total: 1,
    });
    expect(await useEvents().list({ page: 2, size: 25 })).toEqual({
      items: [],
      total: 1,
    });
  });

  it("fetches one event by id, or nothing", async () => {
    expect(await useEvents().fetch(3)).toEqual(RECORD);
    expect(await useEvents().fetch(9)).toBeNull();
  });

  it("creates an event from its body, the date or the day as the body says", async () => {
    const record = await useEvents().create({
      slug: "new",
      title: "New",
      date: "2026-12-24",
      start: "18:00",
      status: "draft",
    });
    expect(created).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "new",
        date: "2026-12-24",
        day: null,
        weeks: null,
        start: "18:00",
        end: null,
      }),
    );
    expect(record).toMatchObject({ id: 5, slug: "new" });
  });

  it("hands back nothing when nothing was written", async () => {
    created.mockResolvedValueOnce(null as never);
    expect(
      await useEvents().create({
        slug: "new",
        title: "New",
        day: "monday",
        start: "18:00",
        status: "draft",
      }),
    ).toBeNull();
  });

  it("replaces every field of an event, or nothing when no event has the id", async () => {
    const body = {
      slug: "worship-service",
      title: "Worship",
      day: "sunday" as const,
      start: "10:00",
      status: "published" as const,
    };
    expect(await useEvents().update(3, body)).toEqual(RECORD);
    expect(updated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, title: "Worship", date: null }),
    );
    expect(await useEvents().update(9, body)).toBeNull();
  });

  it("removes an event, and says whether there was one", async () => {
    expect(await useEvents().remove(3)).toBe(true);
    expect(await useEvents().remove(9)).toBe(false);
  });
});
