import { contract } from "@bbf/database";
import { migrations } from "@bbf/database/migrations";
import { queries } from "@bbf/database/queries";
import { seeds } from "@bbf/database/seeds";
import {
  churchEvent,
  eventBody,
  sermon,
  sermonBody,
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
      slug: "worship-service",
      title: "Worship Service",
      summary: "We gather on Sunday morning to worship God together.",
      day: "sunday",
      start: "10:00",
      end: "11:30",
    });
    expect(
      events.find((event) => event.slug === "stamp-ministry")?.weeks,
    ).toEqual([1, 3]);
  });

  it("reads a seeded event's own page, its body as the tree", async () => {
    const row = await db.web.events.fetch.first({ slug: "prayer-meeting" });
    const event = toChurchEvent(row!);
    expect(event.body).toMatchObject({
      type: "root",
      children: [
        expect.objectContaining({ type: "element", tagName: "p" }),
        { type: "text", value: "\n" },
        expect.objectContaining({ type: "element", tagName: "p" }),
      ],
    });
    expect(churchEvent.safeParse(event).success).toBe(true);
  });

  it("writes a one-off from its body, and reads it back as upcoming", async () => {
    const body = eventBody.parse({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      note: "Candlelight",
      summary: "A candlelight service.",
      body: "Come **early**.",
      date: "2026-12-24",
      start: "18:00",
      end: "19:30",
      status: "published",
    });
    const created = await db.admin.events.create.first(toEventArguments(body));
    const id = created!.id;

    // The body is stored as it was written, and the lists leave it out.
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      body: "Come **early**.",
    });
    const upcoming = await db.web.events.upcoming({ from: "2026-12-01" });
    expect(upcoming.map(toChurchEvent)).toEqual([
      {
        slug: "christmas-eve",
        title: "Christmas Eve Service",
        note: "Candlelight",
        summary: "A candlelight service.",
        date: "2026-12-24",
        start: "18:00",
        end: "19:30",
      },
    ]);

    // Its own page carries the body, as the tree.
    const page = await db.web.events.fetch.first({ slug: "christmas-eve" });
    expect(toChurchEvent(page!)).toEqual({
      ...toChurchEvent(upcoming[0]!),
      body: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [
              { type: "text", value: "Come " },
              {
                type: "element",
                tagName: "strong",
                properties: {},
                children: [{ type: "text", value: "early" }],
              },
              { type: "text", value: "." },
            ],
          },
        ],
      },
    });

    // Updated as weekly from a body: the date goes, the day and weeks come.
    const weekly = eventBody.parse({
      slug: "christmas-eve",
      title: "Advent Evening",
      location: "Fellowship Hall",
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
      status: "published",
    });
    await db.admin.events.update({ ...toEventArguments(weekly), id });
    const found = await db.web.events.fetch.first({ slug: "christmas-eve" });
    expect(toChurchEvent(found!)).toEqual({
      slug: "christmas-eve",
      title: "Advent Evening",
      location: "Fellowship Hall",
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
    });

    expect(await db.admin.events.delete({ id })).toBe(1);
  });

  it("writes a draft the site does not list", async () => {
    const body = eventBody.parse({
      slug: "draft",
      title: "Draft",
      day: "monday",
      start: "19:00",
    });
    const created = await db.admin.events.create.first(toEventArguments(body));
    expect(
      (await db.web.events.weekly()).map(toChurchEvent).map((e) => e.slug),
    ).not.toContain("draft");
    expect(await db.web.events.fetch.first({ slug: "draft" })).toBeNull();
    expect(await db.admin.events.delete({ id: created!.id })).toBe(1);
  });
});

describe("staff", () => {
  it("writes a member from their body, and reads them back as listed", async () => {
    const body = staffBody.parse({
      slug: "pastor",
      name: "Pastor Name",
      role: "Pastor",
      summary: "Serving since 2010.",
      bio: "Serving **since 2010**.",
      phone: "530-555-0100",
      position: 0,
      status: "published",
    });
    const created = await db.admin.staff.create.first(toStaffArguments(body));
    const id = created!.id;

    // The bio is stored as it was written, and served as the tree.
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      bio: "Serving **since 2010**.",
    });
    const [first] = (await db.web.staff.list()).map(toStaffMember);
    expect(first).toEqual({
      slug: "pastor",
      name: "Pastor Name",
      role: "Pastor",
      summary: "Serving since 2010.",
      bio: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [
              { type: "text", value: "Serving " },
              {
                type: "element",
                tagName: "strong",
                properties: {},
                children: [{ type: "text", value: "since 2010" }],
              },
              { type: "text", value: "." },
            ],
          },
        ],
      },
      phone: "530-555-0100",
    });
    expect(staffMember.safeParse(first).success).toBe(true);

    const one = await db.web.staff.fetch.first({ slug: "pastor" });
    expect(toStaffMember(one!)).toEqual(first);
    const row = await db.admin.staff.fetch.first({ id });
    expect(toStaffMember(row!)).toEqual(first);

    expect(await db.admin.staff.delete({ id })).toBe(1);
  });

  it("writes a draft the site does not list", async () => {
    const body = staffBody.parse({ slug: "draft", name: "Draft", role: "x" });
    const created = await db.admin.staff.create.first(toStaffArguments(body));
    expect(
      (await db.web.staff.list()).map(toStaffMember).map((m) => m.slug),
    ).not.toContain("draft");
    expect(await db.admin.staff.delete({ id: created!.id })).toBe(1);
  });
});

describe("sermons", () => {
  it("writes a sermon from its body, and reads it back as served", async () => {
    const body = sermonBody.parse({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      body: "What **faith** does.",
      video: "abc123",
      date: "2026-10-04",
      status: "published",
    });
    const created = await db.admin.sermons.create.first(
      toSermonArguments(body),
    );
    const id = created!.id;

    // The body is stored as it was written, and the list leaves it out.
    expect(await db.admin.sermons.fetch.first({ id })).toMatchObject({
      body: "What **faith** does.",
    });
    const [listed] = (await db.web.sermons.list({ limit: 3 })).map(toSermon);
    expect(listed).toEqual({
      slug: "faith-and-works",
      title: "Faith & Works",
      speaker: "Pastor Name",
      summary: "James 2, and what faith does.",
      video: "abc123",
      date: "2026-10-04",
    });
    expect(sermon.safeParse(listed).success).toBe(true);

    // Its own page carries the body, as the tree.
    const page = await db.web.sermons.fetch.first({ slug: "faith-and-works" });
    expect(toSermon(page!)).toEqual({
      ...listed,
      body: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [
              { type: "text", value: "What " },
              {
                type: "element",
                tagName: "strong",
                properties: {},
                children: [{ type: "text", value: "faith" }],
              },
              { type: "text", value: " does." },
            ],
          },
        ],
      },
    });
    const row = await db.admin.sermons.fetch.first({ id });
    expect(toSermon(row!)).toEqual(toSermon(page!));

    // Updated from a body that names no video: the video goes.
    const unrecorded = sermonBody.parse({
      slug: "faith-and-works",
      title: "Faith and Works",
      date: "2026-10-11",
      status: "published",
    });
    await db.admin.sermons.update({ ...toSermonArguments(unrecorded), id });
    const found = await db.web.sermons.fetch.first({ slug: "faith-and-works" });
    expect(toSermon(found!)).toEqual({
      slug: "faith-and-works",
      title: "Faith and Works",
      date: "2026-10-11",
    });

    expect(await db.admin.sermons.delete({ id })).toBe(1);
  });

  it("writes a draft the site does not list", async () => {
    const body = sermonBody.parse({
      slug: "draft",
      title: "Draft",
      date: "2026-10-04",
    });
    const created = await db.admin.sermons.create.first(
      toSermonArguments(body),
    );
    expect(await db.web.sermons.list({ limit: 3 })).toEqual([]);
    expect(await db.web.sermons.fetch.first({ slug: "draft" })).toBeNull();
    expect(await db.admin.sermons.delete({ id: created!.id })).toBe(1);
  });
});
