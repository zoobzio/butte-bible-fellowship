import { makeTestBezoar } from "@bezoar/testing";
import { ForbiddenQueryError } from "bezoar";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { contract } from "../.output/index.mjs";
import { migrations } from "../.output/migrations.mjs";
import { queries } from "../.output/queries.mjs";
import { roles } from "../.output/roles.mjs";
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
      "web.sermons.fetch",
      "web.sermons.list",
      "web.staff.fetch",
      "web.staff.list",
    ]);
    expect(names.filter((name) => name.startsWith("admin."))).toHaveLength(15);
    expect(names).toHaveLength(23);
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
    expect(await db.web.sermons.list({ limit: 3 })).toEqual([]);
    expect(await db.web.sermons.fetch.first({ slug: "nope" })).toBeNull();
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
  const sermon = {
    slug: "faith-and-works",
    title: "Faith & Works",
    speaker: "Pastor Name",
    video: "abc123",
    date: "2026-10-04",
    status: "published" as const,
  };

  it("creates, reads, updates and deletes a sermon", async () => {
    const created = await db.admin.sermons.create.first(sermon);
    expect(created?.slug).toBe("faith-and-works");
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // What is left out is none; the date is a day, not a moment.
    expect(await db.admin.sermons.fetch.first({ id })).toMatchObject({
      speaker: "Pastor Name",
      summary: null,
      body: null,
      image: null,
      video: "abc123",
      date: "2026-10-04",
      status: "published",
    });

    const updated = await db.admin.sermons.update.first({
      ...sermon,
      id,
      title: "Faith and Works",
      speaker: null,
      summary: "James 2, and what faith does.",
      body: "## James 2\n\nWhat faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: null,
      date: "2026-10-11",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.sermons.fetch.first({ id })).toMatchObject({
      title: "Faith and Works",
      speaker: null,
      summary: "James 2, and what faith does.",
      body: "## James 2\n\nWhat faith does.",
      image: "https://cdn.example.com/sermons/faith-and-works.jpg",
      video: null,
      date: "2026-10-11",
    });

    expect(await db.admin.sermons.delete({ id })).toBe(1);
    expect(await db.admin.sermons.fetch.first({ id })).toBeNull();
    expect(await db.admin.sermons.delete({ id })).toBe(0);
  });

  it("lists the newest first, and the web as many as asked with no body", async () => {
    const older = await db.admin.sermons.create.first({
      ...sermon,
      slug: "older",
      video: "older1",
      body: "Older.",
      date: "2026-09-27",
    });
    const newer = await db.admin.sermons.create.first({
      ...sermon,
      slug: "newer",
      video: "newer1",
      date: "2026-10-04",
    });
    const later = await db.admin.sermons.create.first({
      ...sermon,
      slug: "later",
      video: null,
      date: "2026-10-11",
    });

    expect((await db.admin.sermons.list()).map((row) => row.slug)).toEqual([
      "later",
      "newer",
      "older",
    ]);
    const listed = await db.web.sermons.list({ limit: 5 });
    expect(listed.map((row) => row.slug)).toEqual(["later", "newer", "older"]);
    expect(listed[0]).not.toHaveProperty("body");
    expect(listed[0]).not.toHaveProperty("status");
    expect(listed[0]).toMatchObject({ video: null, date: "2026-10-11" });
    expect(await db.web.sermons.list({ limit: 2 })).toHaveLength(2);

    expect(await db.web.sermons.fetch.first({ slug: "older" })).toMatchObject({
      title: "Faith & Works",
      body: "Older.",
      video: "older1",
    });

    for (const row of [older, newer, later]) {
      expect(await db.admin.sermons.delete({ id: row!.id })).toBe(1);
    }
  });

  it("keeps a draft or an archived sermon off the site", async () => {
    const draft = await db.admin.sermons.create.first({
      ...sermon,
      slug: "draft",
      video: null,
      status: "draft",
    });
    const archived = await db.admin.sermons.create.first({
      ...sermon,
      slug: "archived",
      video: null,
      status: "archived",
    });

    expect(await db.admin.sermons.list()).toHaveLength(2);
    expect(await db.web.sermons.list({ limit: 5 })).toEqual([]);
    expect(await db.web.sermons.fetch.first({ slug: "draft" })).toBeNull();

    await db.admin.sermons.update({
      ...sermon,
      id: draft!.id,
      slug: "draft",
      video: null,
    });
    expect(await db.web.sermons.fetch.first({ slug: "draft" })).toMatchObject({
      title: "Faith & Works",
    });

    expect(await db.admin.sermons.delete({ id: draft!.id })).toBe(1);
    expect(await db.admin.sermons.delete({ id: archived!.id })).toBe(1);
  });

  it("refuses a slug or a video already taken", async () => {
    const created = await db.admin.sermons.create.first(sermon);
    expect(
      await refusal(db.admin.sermons.create({ ...sermon, video: "other" })),
    ).toMatch(/sermons_slug_key/);
    expect(
      await refusal(db.admin.sermons.create({ ...sermon, slug: "other" })),
    ).toMatch(/sermons_video_key/);
    // A sermon without a recording takes no video, and any number may.
    const unrecorded = await db.admin.sermons.create.first({
      ...sermon,
      slug: "unrecorded",
      video: null,
    });
    expect(unrecorded?.slug).toBe("unrecorded");
    expect(await db.admin.sermons.delete({ id: created!.id })).toBe(1);
    expect(await db.admin.sermons.delete({ id: unrecorded!.id })).toBe(1);
  });
});

// A role holds an app to its group: the service of a role offers the
// queries the kit found it may run, and Postgres runs each as the role, so
// what the service would not offer, the database refuses too.
describe("roles", () => {
  type Scoped<R extends keyof typeof contract.roles> = Awaited<
    ReturnType<typeof makeTestBezoar<typeof contract, R>>
  >;
  let web: Scoped<"web">;
  let admin: Scoped<"admin">;

  beforeAll(async () => {
    [web, admin] = await Promise.all([
      makeTestBezoar(contract, {
        queries,
        migrations,
        seeds,
        roles,
        role: "web",
      }),
      makeTestBezoar(contract, {
        queries,
        migrations,
        seeds,
        roles,
        role: "admin",
      }),
    ]);
  });

  afterAll(() => Promise.all([web.close(), admin.close()]));

  it("carries a grant for each app", () => {
    expect(roles.map((grant) => grant.role)).toEqual(["admin", "web"]);
  });

  it("lets web read and admin do everything", () => {
    const names = Object.keys(contract.queries);
    expect(contract.roles.admin).toEqual(names);
    expect(contract.roles.web).toEqual(
      names.filter((name) => /\.(fetch|list|upcoming|weekly)$/.test(name)),
    );
  });

  it("reads the site as web", async () => {
    expect(await web.web.staff.list()).toHaveLength(3);
    expect(await web.web.events.weekly()).toHaveLength(8);
  });

  it("refuses a write as web, by name and in the database", async () => {
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.events.delete", { id: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    await expect(
      web.build
        .deleteFrom("events")
        .where("slug", "=", "prayer-meeting")
        .execute(),
    ).rejects.toThrow(/permission denied for table events/);
    expect(
      await web.web.events.fetch.first({ slug: "prayer-meeting" }),
    ).not.toBeNull();
  });

  it("writes as admin, with ids the database fills", async () => {
    const created = await admin.admin.staff.create.first({
      slug: "deacon",
      name: "Deacon Name",
      role: "Deacon",
      position: 9,
      status: "draft",
    });
    expect(created?.id).toBeGreaterThan(0);
    expect(
      await admin.admin.staff.fetch.first({ id: created!.id }),
    ).toMatchObject({
      slug: "deacon",
      status: "draft",
    });
    expect(await admin.admin.staff.delete({ id: created!.id })).toBe(1);
  });
});
