import { afterEach, describe, expect, it, vi } from "vitest";

import { service } from "@bbf/nuxt/testing/bezoar";
import { useEvents } from "~~/server/composables/events";

const WEEKLY = {
  slug: "worship-service",
  title: "Worship Service",
  note: null,
  summary: "We gather on Sunday morning.",
  image: null,
  location: null,
  date: null,
  day: "sunday" as const,
  weeks: null,
  start_time: "10:00:00",
  end_time: "11:30:00",
};

const ONE_OFF = {
  slug: "christmas-eve",
  title: "Christmas Eve Service",
  note: "Candlelight",
  summary: null,
  image: null,
  location: null,
  date: "2026-12-24",
  start_time: "18:00:00",
  end_time: null,
};

const PAGE = { ...WEEKLY, body: "We gather." };

const list = vi.fn(async (_args: { from: string }) => [WEEKLY, ONE_OFF]);
const weekly = vi.fn(async () => [WEEKLY]);
const upcoming = vi.fn(async (_args: { from: string }) => [ONE_OFF]);
const first = vi.fn(async (args: { slug: string }) =>
  args.slug === PAGE.slug ? PAGE : null,
);

Object.assign(service, {
  web: { events: { list, weekly, upcoming, fetch: { first } } },
});

afterEach(() => {
  list.mockClear();
  weekly.mockClear();
  upcoming.mockClear();
  first.mockClear();
  vi.useRealTimers();
});

describe("useEvents", () => {
  it("lists the events as the API serves them, from the date asked", async () => {
    expect(await useEvents().list("2026-12-01")).toEqual([
      {
        slug: "worship-service",
        title: "Worship Service",
        summary: "We gather on Sunday morning.",
        day: "sunday",
        start: "10:00",
        end: "11:30",
      },
      {
        slug: "christmas-eve",
        title: "Christmas Eve Service",
        note: "Candlelight",
        date: "2026-12-24",
        start: "18:00",
      },
    ]);
    expect(list).toHaveBeenCalledWith({ from: "2026-12-01" });
  });

  it("lists from today at the church when no date is asked", async () => {
    vi.useFakeTimers({
      now: new Date("2026-10-04T03:00:00Z"),
      toFake: ["Date"],
    });
    await useEvents().list();
    expect(list).toHaveBeenCalledWith({ from: "2026-10-03" });
    await useEvents().upcoming();
    expect(upcoming).toHaveBeenCalledWith({ from: "2026-10-03" });
  });

  it("lists the weekly events and the upcoming one-offs on their own", async () => {
    expect(await useEvents().weekly()).toEqual([
      expect.objectContaining({ slug: "worship-service", day: "sunday" }),
    ]);
    expect(await useEvents().upcoming("2026-12-01")).toEqual([
      expect.objectContaining({ slug: "christmas-eve", date: "2026-12-24" }),
    ]);
    expect(upcoming).toHaveBeenCalledWith({ from: "2026-12-01" });
  });

  it("fetches one event by slug, its body as the tree, or nothing", async () => {
    expect(await useEvents().fetch("worship-service")).toMatchObject({
      slug: "worship-service",
      body: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: "We gather." }],
          },
        ],
      },
    });
    expect(first).toHaveBeenCalledWith({ slug: "worship-service" });
    expect(await useEvents().fetch("nope")).toBeNull();
  });
});
