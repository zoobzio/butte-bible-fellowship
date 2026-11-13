import { contract } from "@bbf/database";
import { migrations } from "@bbf/database/migrations";
import { queries } from "@bbf/database/queries";
import { seeds } from "@bbf/database/seeds";
import {
  churchEvent,
  contentBody,
  contentRecord,
  eventBody,
  eventRecord,
  hast,
  page,
  sermon,
  sermonBody,
  staffBody,
  staffMember,
  staffRecord,
} from "@bbf/schema";
import { makeTestBezoar } from "@bezoar/testing";
import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  toContentArguments,
  toEventArguments,
  toSermonArguments,
  toStaffArguments,
} from "../src/dao";
import {
  toChurchEvent,
  toContentDocument,
  toContentRecord,
  toEventRecord,
  toSermon,
  toStaffMember,
  toStaffRecord,
} from "../src/dto";

let db: Awaited<ReturnType<typeof makeTestBezoar<typeof contract>>>;

beforeAll(async () => {
  db = await makeTestBezoar(contract, {
    queries,
    migrations,
    seeds,
    database: { extensions: { fuzzystrmatch, pg_trgm } },
  });
});

afterAll(() => db.close());

describe("content", () => {
  it("reads every seeded page as a document the schema accepts, its headings with ids", async () => {
    for (const { slug } of await db.web.content.list()) {
      const row = await db.web.content.fetch.first({ slug });
      const document = toContentDocument(row!);
      expect(page.parse(document.data.matter), slug).toEqual(
        document.data.matter,
      );
      expect(hast.safeParse(document).success, slug).toBe(true);
    }
    const about = toContentDocument(
      (await db.web.content.fetch.first({ slug: "about-us" }))!,
    );
    expect(about.children[0]).toMatchObject({
      tagName: "h1",
      properties: { id: "our-vision" },
    });
    const home = toContentDocument(
      (await db.web.content.fetch.first({ slug: "index" }))!,
    );
    expect(home.data.matter).toEqual({
      title: "Butte Bible Fellowship – The Church on Pillsbury Road",
      description: "A non-denominational local church in Chico, California.",
    });
  });

  it("writes a page from its body, and reads it back as the admin and the site do", async () => {
    const body = contentBody.parse({
      slug: "membership",
      title: "Membership",
      description: "How to join.",
    });
    const created = await db.admin.content.create.first(
      toContentArguments(body),
    );
    const id = created!.id;
    const record = toContentRecord(
      (await db.admin.content.fetch.first({ id }))!,
    );
    expect(contentRecord.parse(record)).toEqual(record);
    expect(record).toMatchObject({
      id,
      slug: "membership",
      description: "How to join.",
    });
    expect(record.body).toBeUndefined();

    expect(
      toContentDocument(
        (await db.web.content.fetch.first({ slug: "membership" }))!,
      ),
    ).toEqual({
      type: "root",
      data: { matter: { title: "Membership", description: "How to join." } },
      children: [],
    });

    await db.admin.content.update({
      ...toContentArguments(
        contentBody.parse({ ...body, description: undefined }),
      ),
      id,
    });
    expect(
      toContentRecord((await db.admin.content.fetch.first({ id }))!)
        .description,
    ).toBeUndefined();
    await db.admin.content.delete({ id });
  });
});

describe("events", () => {
  const all = {
    size: 100,
    offset: 0,
    tz: "America/Los_Angeles",
    direction: "asc",
  };

  const article = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: "Come early." }],
      },
    ],
  };

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
      events.find((event) => event.slug === "stamp-ministry"),
    ).toMatchObject({ day: "tuesday", weeks: [1, 3] });
  });

  it("reads a seeded event's own page, its body as the tree", async () => {
    const row = await db.web.events.fetch.first({ slug: "prayer-meeting" });
    const event = toChurchEvent(row!);
    expect(event.body).toMatchObject({
      type: "root",
      children: [
        expect.objectContaining({ type: "element", tagName: "p" }),
        expect.objectContaining({ type: "element", tagName: "p" }),
      ],
    });
    expect(event.day).toBe("thursday");
    expect(churchEvent.safeParse(event).success).toBe(true);
  });

  it("writes a one-off from its body, and reads it back as upcoming", async () => {
    const body = eventBody.parse({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      summary: "A candlelight service.",
      date: "2026-12-24",
      start: "18:00",
      end: "19:30",
    });
    const created = await db.admin.events.create.first(toEventArguments(body));
    const id = created!.id;
    await db.admin.events.body({ id, body: article });

    const record = toEventRecord((await db.admin.events.fetch.first({ id }))!);
    expect(record).toMatchObject({
      id,
      slug: "christmas-eve",
      body: article,
      date: "2026-12-24",
      day: "thursday",
      recurring: false,
      start: "18:00",
      end: "19:30",
    });
    expect(eventRecord.safeParse(record).success).toBe(true);
    expect(
      (await db.admin.events.list(all)).map(toEventRecord).map((e) => e.slug),
    ).toContain("christmas-eve");
    const upcoming = await db.web.events.upcoming({ from: "2026-12-01" });
    expect(upcoming.map(toChurchEvent)).toEqual([
      {
        slug: "christmas-eve",
        title: "Christmas Eve Service",
        summary: "A candlelight service.",
        date: "2026-12-24",
        start: "18:00",
        end: "19:30",
      },
    ]);

    const page = await db.web.events.fetch.first({ slug: "christmas-eve" });
    expect(toChurchEvent(page!)).toEqual({
      ...toChurchEvent(upcoming[0]!),
      body: article,
    });

    const weekly = eventBody.parse({
      slug: "christmas-eve",
      title: "Advent Evening",
      date: "2026-12-02",
      recurring: true,
      weeks: [1, 2, 3, 4],
      start: "18:00",
    });
    await db.admin.events.update({ ...toEventArguments(weekly), id });
    const found = await db.web.events.fetch.first({ slug: "christmas-eve" });
    // The details are replaced; what is written about it stays.
    expect(toChurchEvent(found!)).toEqual({
      slug: "christmas-eve",
      title: "Advent Evening",
      body: article,
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
    });
    expect(await db.web.events.upcoming({ from: "2026-12-01" })).toEqual([]);

    expect(await db.admin.events.delete({ id })).toBe(1);
  });

  it("carries no status: an event written is on the site", async () => {
    const body = eventBody.parse({
      slug: "choir",
      title: "Choir Practice",
      date: "2026-01-05",
      recurring: true,
      start: "19:00",
    });
    const created = await db.admin.events.create.first(toEventArguments(body));
    expect(
      (await db.web.events.weekly()).map(toChurchEvent).map((e) => e.slug),
    ).toContain("choir");
    expect(await db.admin.events.delete({ id: created!.id })).toBe(1);
  });
});

describe("staff", () => {
  const bio = {
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
  };

  it("writes a member from their body, and reads them back as listed", async () => {
    const body = staffBody.parse({
      name: "Pastor Name",
      role: "pastor",
      summary: "Serving since 2010.",
      phone: "530-555-0100",
    });
    const created = await db.admin.staff.create.first(toStaffArguments(body));
    const id = created!.id;
    await db.admin.staff.bio({ id, bio });

    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({ bio });

    const record = toStaffRecord((await db.admin.staff.fetch.first({ id }))!);
    expect(record).toMatchObject({
      id,
      name: "Pastor Name",
      role: "pastor",
      bio,
    });
    expect(staffRecord.safeParse(record).success).toBe(true);
    const [first] = (await db.web.staff.list()).map(toStaffMember);
    expect(first).toEqual({
      id,
      name: "Pastor Name",
      role: "pastor",
      summary: "Serving since 2010.",
      bio,
      phone: "530-555-0100",
    });
    expect(staffMember.safeParse(first).success).toBe(true);

    const row = await db.admin.staff.fetch.first({ id });
    expect(toStaffMember(row!)).toEqual(first);

    expect(await db.admin.staff.delete({ id })).toBe(1);
  });

  it("writes a member the site lists, and the admin does", async () => {
    const body = staffBody.parse({ name: "Office Name", role: "staff" });
    const created = await db.admin.staff.create.first(toStaffArguments(body));
    expect(
      (await db.web.staff.list()).map(toStaffMember).map((m) => m.name),
    ).toContain("Office Name");
    expect(
      (
        await db.admin.staff.list({
          size: 25,
          offset: 0,
          tz: "America/Los_Angeles",
          sort: "role",
          direction: "asc",
        })
      )
        .map(toStaffRecord)
        .map((m) => m.name),
    ).toContain("Office Name");
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
