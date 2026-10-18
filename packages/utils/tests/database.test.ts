import { contract } from "@bbf/database";
import { migrations } from "@bbf/database/migrations";
import { queries } from "@bbf/database/queries";
import { seeds } from "@bbf/database/seeds";
import {
  churchEvent,
  eventBody,
  sermon,
  staffBody,
  staffMember,
} from "@bbf/schema";
import { makeTestBezoar } from "@bezoar/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  toEventArguments,
  toSermonArguments,
  toStaffArguments,
} from "../src/dao";
import { toChurchEvent, toSermon, toStaffMember } from "../src/dto";

let db: Awaited<ReturnType<typeof makeTestBezoar<typeof contract>>>;

// The transforms, proved against the database itself: what a body writes
// through `dao/` reads back through `dto/` as the thing the body described.
beforeAll(async () => {
  db = await makeTestBezoar(contract, { queries, migrations, seeds });
});

afterAll(() => db.close());

describe("events", () => {
  it("reads the seeded calendar as events the schema accepts", async () => {
    const events = (await db.web.events.weekly()).map(toChurchEvent);
    expect(events).toHaveLength(8);
    for (const event of events) {
      expect(churchEvent.safeParse(event).success).toBe(true);
    }
    expect(events.find((event) => event.slug === "worship-service")).toEqual({
      title: "Worship Service",
      slug: "worship-service",
      day: "sunday",
      start: "10:00",
      end: "11:30",
    });
    expect(
      events.find((event) => event.slug === "stamp-ministry")?.weeks,
    ).toEqual([1, 3]);
  });

  it("writes a one-off from its body, and reads it back as upcoming", async () => {
    const body = eventBody.parse({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      note: "Candlelight",
      date: "2026-12-24",
      start: "18:00",
      end: "19:30",
    });
    const created = await db.admin.events.create.first(toEventArguments(body));
    const id = created!.id;

    const upcoming = await db.web.events.upcoming({ from: "2026-12-01" });
    expect(upcoming.map(toChurchEvent)).toEqual([
      {
        title: "Christmas Eve Service",
        slug: "christmas-eve",
        note: "Candlelight",
        date: "2026-12-24",
        start: "18:00",
        end: "19:30",
      },
    ]);

    // Updated as weekly from a body: the date goes, the day and weeks come.
    const weekly = eventBody.parse({
      slug: "christmas-eve",
      title: "Advent Evening",
      location: "Fellowship Hall",
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
    });
    await db.admin.events.update({ ...toEventArguments(weekly), id });
    const found = await db.web.events.bySlug.first({ slug: "christmas-eve" });
    expect(toChurchEvent(found!)).toEqual({
      title: "Advent Evening",
      slug: "christmas-eve",
      location: "Fellowship Hall",
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
    });

    expect(await db.admin.events.delete({ id })).toBe(1);
  });
});

describe("staff", () => {
  it("writes a member from their body, and reads them back as listed", async () => {
    const body = staffBody.parse({
      slug: "pastor",
      name: "Pastor Name",
      role: "Pastor",
      bio: "Serving since 2010.",
      position: 0,
    });
    const created = await db.admin.staff.create.first(toStaffArguments(body));
    const id = created!.id;

    const [first] = (await db.web.staff.list()).map(toStaffMember);
    expect(first).toEqual({
      name: "Pastor Name",
      role: "Pastor",
      bio: "Serving since 2010.",
    });
    expect(staffMember.safeParse(first).success).toBe(true);

    const row = await db.admin.staff.byId.first({ id });
    expect(toStaffMember(row!)).toEqual(first);

    expect(await db.admin.staff.delete({ id })).toBe(1);
  });
});

describe("sermons", () => {
  it("writes a sermon as the feed lists it, and reads it back as served", async () => {
    const listed = sermon.parse({
      id: "abc123",
      title: "Sermon One",
      published: "2026-10-04T18:16:28+00:00",
      thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
    });
    await db.admin.sermons.upsert(toSermonArguments(listed));

    const row = await db.web.sermons.byId.first({ id: "abc123" });
    const served = toSermon(row!);
    expect(served).toEqual({
      ...listed,
      published: "2026-10-04T18:16:28.000Z",
    });
    expect(new Date(served.published)).toEqual(new Date(listed.published));
    expect(sermon.safeParse(served).success).toBe(true);

    expect(await db.admin.sermons.delete({ id: "abc123" })).toBe(1);
  });
});
