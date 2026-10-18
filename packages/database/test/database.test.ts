import { makeTestBezoar } from "@bezoar/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { contract } from "../.output/index.mjs";
import { migrations } from "../.output/migrations.mjs";
import { queries } from "../.output/queries.mjs";
import { seeds } from "../.output/seeds.mjs";

let db: Awaited<ReturnType<typeof makeTestBezoar<typeof contract>>>;

/** What Postgres said about a query the service refused: its `QueryError`'s cause. */
const refusal = (call: Promise<unknown>): Promise<string> =>
  call.then(
    () => "accepted",
    (error: unknown) => String((error as { cause?: unknown }).cause),
  );

// The service applies every migration and runs every seed as it comes up,
// so a migration or a seed Postgres rejects fails here.
beforeAll(async () => {
  db = await makeTestBezoar(contract, { queries, migrations, seeds });
});

afterAll(() => db.close());

describe("the build", () => {
  it("carries the staff, events and sermons migrations in order", () => {
    expect(migrations.map((migration) => migration.name)).toEqual([
      "staff",
      "events",
      "sermons",
    ]);
  });

  it("carries the staff and events seeds in order", () => {
    expect(seeds.map((seed) => seed.name)).toEqual(["01_staff", "02_events"]);
  });

  it("reads the statuses content passes through from the schema", () => {
    expect(contract.enums.content_status).toEqual([
      "draft",
      "published",
      "archived",
    ]);
  });

  it("reads the days of the week from the schema, Sunday first", () => {
    expect(contract.enums.event_day).toEqual([
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]);
  });

  it("groups the queries by app: reads for the web, CRUD for admin", () => {
    const names = Object.keys(contract.queries);
    expect(names.filter((name) => name.startsWith("web."))).toEqual([
      "web.events.fetch",
      "web.events.list",
      "web.events.upcoming",
      "web.events.weekly",
      "web.sermons.byId",
      "web.sermons.latest",
      "web.staff.fetch",
      "web.staff.list",
    ]);
    expect(names.filter((name) => name.startsWith("admin."))).toHaveLength(14);
    expect(names).toHaveLength(22);
  });
});

describe("web", () => {
  it("lists the staff in their order", async () => {
    const staff = await db.web.staff.list();
    expect(staff).toHaveLength(3);
    expect(staff[0]).toMatchObject({
      slug: "elder-1",
      name: "Elder Name",
      role: "Elder",
      bio: null,
      photo: null,
      email: null,
      phone: null,
    });
    expect(staff[0]?.summary).toMatch(/^A few words/);
  });

  it("finds a member by slug, or nothing", async () => {
    expect(await db.web.staff.fetch.first({ slug: "elder-2" })).toMatchObject({
      name: "Elder Name",
      role: "Elder",
    });
    expect(await db.web.staff.fetch.first({ slug: "nope" })).toBeNull();
  });

  it("lists the weekly events Sunday first, then by start", async () => {
    const events = await db.web.events.weekly();
    expect(events.map((event) => event.slug)).toEqual([
      "adult-sunday-school",
      "fellowship-time",
      "worship-service",
      "mens-breakfast-bible-study",
      "womens-bible-study",
      "stamp-ministry",
      "prayer-meeting",
      "volunteer-work-fellowship",
    ]);
    expect(events[2]).toMatchObject({
      day: "sunday",
      weeks: null,
      start_time: "10:00:00",
      end_time: "11:30:00",
      image: null,
    });
    expect(events[2]?.summary).toMatch(/^We gather on Sunday morning/);
    expect(events[2]).not.toHaveProperty("body");
    expect(events[5]).toMatchObject({ slug: "stamp-ministry", weeks: [1, 3] });
    expect(events[6]).toMatchObject({ note: "All welcome" });
  });

  it("lists the calendar's events: the weekly ones, then the one-offs to come", async () => {
    const events = await db.web.events.list({ from: "2026-01-01" });
    expect(events.map((event) => event.slug)).toEqual(
      (await db.web.events.weekly()).map((event) => event.slug),
    );
    expect(events[0]).not.toHaveProperty("body");
  });

  it("finds an event by slug, with what is written about it, or nothing", async () => {
    const found = await db.web.events.fetch.first({ slug: "prayer-meeting" });
    expect(found).toMatchObject({
      title: "Prayer Meeting",
      day: "thursday",
      date: null,
    });
    expect(found?.body).toMatch(/^We set aside time/);
    expect(await db.web.events.fetch.first({ slug: "nope" })).toBeNull();
  });

  it("has no upcoming one-offs and no sermons until admin adds them", async () => {
    expect(await db.web.events.upcoming({ from: "2026-01-01" })).toEqual([]);
    expect(await db.web.sermons.latest({ limit: 3 })).toEqual([]);
    expect(await db.web.sermons.byId.first({ id: "nope" })).toBeNull();
  });
});

describe("admin.staff", () => {
  const member = {
    slug: "pastor",
    name: "Pastor Name",
    role: "Pastor",
    photo: "https://cdn.example.com/staff/pastor.jpg",
    email: "pastor@example.com",
    position: 0,
    status: "published" as const,
  };

  it("creates, reads, updates and deletes a member", async () => {
    const created = await db.admin.staff.create.first(member);
    expect(created?.slug).toBe("pastor");
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // What is left out is none.
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      summary: null,
      bio: null,
      phone: null,
      photo: member.photo,
      email: member.email,
      position: 0,
      status: "published",
    });

    // Position 0 lists first, ahead of the seeded elders.
    const list = await db.admin.staff.list();
    expect(list.map((row) => row.slug)).toEqual([
      "pastor",
      "elder-1",
      "elder-2",
      "elder-3",
    ]);
    expect((await db.web.staff.list())[0]?.slug).toBe("pastor");

    const updated = await db.admin.staff.update.first({
      ...member,
      id,
      role: "Senior Pastor",
      summary: "Serving since 2010.",
      bio: "## Serving since 2010\n\nA pastor's story.",
      photo: null,
      email: null,
      phone: "530-555-0100",
      position: 9,
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      role: "Senior Pastor",
      summary: "Serving since 2010.",
      bio: "## Serving since 2010\n\nA pastor's story.",
      photo: null,
      email: null,
      phone: "530-555-0100",
      position: 9,
    });

    expect(await db.admin.staff.delete({ id })).toBe(1);
    expect(await db.admin.staff.fetch.first({ id })).toBeNull();
    expect(await db.admin.staff.delete({ id })).toBe(0);
  });

  it("keeps a draft or an archived member off the site", async () => {
    const draft = await db.admin.staff.create.first({
      ...member,
      slug: "draft",
      status: "draft",
    });
    const archived = await db.admin.staff.create.first({
      ...member,
      slug: "archived",
      status: "archived",
    });

    expect(await db.admin.staff.list()).toHaveLength(5);
    expect((await db.web.staff.list()).map((row) => row.slug)).toEqual([
      "elder-1",
      "elder-2",
      "elder-3",
    ]);
    expect(await db.web.staff.fetch.first({ slug: "draft" })).toBeNull();

    await db.admin.staff.update({ ...member, id: draft!.id, slug: "draft" });
    expect(await db.web.staff.fetch.first({ slug: "draft" })).toMatchObject({
      name: "Pastor Name",
    });

    expect(await db.admin.staff.delete({ id: draft!.id })).toBe(1);
    expect(await db.admin.staff.delete({ id: archived!.id })).toBe(1);
  });

  it("refuses a status that is not one, and a slug already taken", async () => {
    // A status the enum lacks is refused before Postgres sees it.
    await expect(
      db.admin.staff.create({
        ...member,
        slug: "x",
        status: "hidden" as never,
      }),
    ).rejects.toThrow(/status: Invalid option/);
    expect(
      await refusal(db.admin.staff.create({ ...member, slug: "elder-1" })),
    ).toMatch(/staff_slug_key/);
  });
});

describe("admin.events", () => {
  it("creates a one-off, which the web lists as upcoming", async () => {
    const created = await db.admin.events.create.first({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      date: "2026-12-24",
      start: "18:00",
      status: "published",
    });
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // What is left out is none.
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      summary: null,
      body: null,
      image: null,
      status: "published",
    });

    expect(await db.web.events.upcoming({ from: "2026-12-01" })).toEqual([
      expect.objectContaining({
        slug: "christmas-eve",
        date: "2026-12-24",
        start_time: "18:00:00",
        end_time: null,
        note: null,
        location: null,
      }),
    ]);
    expect(await db.web.events.upcoming({ from: "2026-12-25" })).toEqual([]);
    expect(
      (await db.web.events.list({ from: "2026-12-01" })).map((e) => e.slug),
    ).toContain("christmas-eve");
    expect(
      (await db.web.events.list({ from: "2026-12-25" })).map((e) => e.slug),
    ).not.toContain("christmas-eve");

    // Re-scheduled as weekly: the date goes, the day comes.
    const updated = await db.admin.events.update.first({
      id,
      slug: "christmas-eve",
      title: "Advent Evening",
      note: "Through December",
      summary: "An evening a week through Advent.",
      body: "## Advent\n\nAn evening a week.",
      image: "https://cdn.example.com/events/advent.jpg",
      location: null,
      date: null,
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      start: "18:00",
      end: "19:00",
      status: "published",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      title: "Advent Evening",
      note: "Through December",
      summary: "An evening a week through Advent.",
      body: "## Advent\n\nAn evening a week.",
      image: "https://cdn.example.com/events/advent.jpg",
      date: null,
      day: "wednesday",
      weeks: [1, 2, 3, 4],
      end_time: "19:00:00",
    });
    expect(await db.web.events.upcoming({ from: "2026-12-01" })).toEqual([]);
    expect((await db.web.events.weekly()).map((event) => event.day)).toContain(
      "wednesday",
    );

    // And back to a one-off: the day and the weeks go.
    await db.admin.events.update({
      id,
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      location: "Pillsbury Road",
      date: "2026-12-24",
      start: "18:00",
      status: "published",
    });
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      note: null,
      summary: null,
      body: null,
      image: null,
      day: null,
      weeks: null,
      date: "2026-12-24",
      location: "Pillsbury Road",
      end_time: null,
    });

    expect(await db.admin.events.delete({ id })).toBe(1);
    expect(await db.admin.events.fetch.first({ id })).toBeNull();
    expect(await db.admin.events.delete({ id })).toBe(0);
  });

  it("keeps a draft or an archived event off the site", async () => {
    const draft = await db.admin.events.create.first({
      slug: "draft",
      title: "Draft",
      day: "monday",
      start: "19:00",
      status: "draft",
    });
    const archived = await db.admin.events.create.first({
      slug: "archived",
      title: "Archived",
      date: "2026-12-24",
      start: "19:00",
      status: "archived",
    });

    expect(await db.admin.events.list()).toHaveLength(10);
    expect((await db.web.events.weekly()).map((e) => e.slug)).not.toContain(
      "draft",
    );
    expect(await db.web.events.upcoming({ from: "2026-01-01" })).toEqual([]);
    expect(await db.web.events.list({ from: "2026-01-01" })).toHaveLength(8);
    expect(await db.web.events.fetch.first({ slug: "draft" })).toBeNull();

    await db.admin.events.update({
      id: draft!.id,
      slug: "draft",
      title: "Draft",
      day: "monday",
      start: "19:00",
      status: "published",
    });
    expect(await db.web.events.fetch.first({ slug: "draft" })).toMatchObject({
      title: "Draft",
    });

    expect(await db.admin.events.delete({ id: draft!.id })).toBe(1);
    expect(await db.admin.events.delete({ id: archived!.id })).toBe(1);
  });

  it("creates a weekly event, with null weeks meaning every week", async () => {
    const every = await db.admin.events.create.first({
      slug: "choir",
      title: "Choir Practice",
      day: "monday",
      start: "19:00",
      end: "20:30",
      status: "published",
    });
    expect(await db.admin.events.fetch.first({ id: every!.id })).toMatchObject({
      day: "monday",
      weeks: null,
    });

    const some = await db.admin.events.create.first({
      slug: "youth-group",
      title: "Youth Group",
      day: "friday",
      weeks: [2, 4],
      start: "18:30",
      status: "published",
    });
    expect(await db.admin.events.fetch.first({ id: some!.id })).toMatchObject({
      weeks: [2, 4],
      end_time: null,
    });

    const list = await db.admin.events.list();
    expect(list.map((event) => event.slug)).toEqual([
      "adult-sunday-school",
      "fellowship-time",
      "worship-service",
      "choir",
      "mens-breakfast-bible-study",
      "womens-bible-study",
      "stamp-ministry",
      "prayer-meeting",
      "volunteer-work-fellowship",
      "youth-group",
    ]);

    expect(await db.admin.events.delete({ id: every!.id })).toBe(1);
    expect(await db.admin.events.delete({ id: some!.id })).toBe(1);
  });

  it("refuses what the schema rules out", async () => {
    const base = {
      slug: "bad",
      title: "Bad",
      start: "10:00",
      status: "draft" as const,
    };
    expect(await refusal(db.admin.events.create({ ...base }))).toMatch(
      /events_date_or_day/,
    );
    expect(
      await refusal(
        db.admin.events.create({ ...base, date: "2026-12-24", day: "monday" }),
      ),
    ).toMatch(/events_date_or_day/);
    expect(
      await refusal(
        db.admin.events.create({ ...base, date: "2026-12-24", weeks: [1] }),
      ),
    ).toMatch(/events_weeks_repeat/);
    expect(
      await refusal(
        db.admin.events.create({ ...base, day: "monday", weeks: [6] }),
      ),
    ).toMatch(/events_weeks_range/);
    expect(
      await refusal(
        db.admin.events.create({ ...base, date: "2026-12-24", end: "09:00" }),
      ),
    ).toMatch(/events_end_after_start/);
    expect(
      await refusal(
        db.admin.events.create({
          ...base,
          slug: "worship-service",
          date: "2026-12-24",
        }),
      ),
    ).toMatch(/events_slug_key/);
  });
});

describe("admin.sermons", () => {
  it("upserts what the feed lists, and the web reads the newest first", async () => {
    const first = await db.admin.sermons.upsert.first({
      id: "abc123",
      title: "Sermon One",
      published: new Date("2026-10-04T18:00:00Z"),
      thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
    });
    await db.admin.sermons.upsert({
      id: "def456",
      title: "Sermon Two",
      published: new Date("2026-10-11T18:00:00Z"),
      thumbnail: "https://i.ytimg.com/vi/def456/hqdefault.jpg",
    });

    // The same id again brings the row up to date rather than failing.
    const again = await db.admin.sermons.upsert.first({
      id: "abc123",
      title: "Sermon One, Retitled",
      published: new Date("2026-10-04T18:00:00Z"),
      thumbnail: "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
    });
    expect(again?.created_at).toEqual(first?.created_at);

    expect(
      (await db.web.sermons.latest({ limit: 5 })).map((sermon) => sermon.title),
    ).toEqual(["Sermon Two", "Sermon One, Retitled"]);
    expect(await db.web.sermons.latest({ limit: 1 })).toHaveLength(1);
    expect(await db.web.sermons.byId.first({ id: "abc123" })).toMatchObject({
      title: "Sermon One, Retitled",
      published_at: new Date("2026-10-04T18:00:00Z"),
    });
    expect(await db.admin.sermons.list()).toHaveLength(2);
    expect(await db.admin.sermons.byId.first({ id: "def456" })).toMatchObject({
      title: "Sermon Two",
    });

    expect(await db.admin.sermons.delete({ id: "abc123" })).toBe(1);
    expect(await db.admin.sermons.delete({ id: "def456" })).toBe(1);
    expect(await db.admin.sermons.list()).toEqual([]);
  });
});
