import { makeTestBezoar } from "@bezoar/testing";
import { ForbiddenQueryError } from "bezoar";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { contract } from "../.output/index.mjs";
import { migrations } from "../.output/migrations.mjs";
import { queries } from "../.output/queries.mjs";
import { roles } from "../.output/roles.mjs";
import { seeds } from "../.output/seeds.mjs";

let db: Awaited<ReturnType<typeof makeTestBezoar<typeof contract>>>;

const refusal = (call: Promise<unknown>): Promise<string> =>
  call.then(
    () => "accepted",
    (error: unknown) => String((error as { cause?: unknown }).cause),
  );

beforeAll(async () => {
  db = await makeTestBezoar(contract, { queries, migrations, seeds });
});

afterAll(() => db.close());

describe("the build", () => {
  it("carries the staff, events, sermons and users migrations in order", () => {
    expect(migrations.map((migration) => migration.name)).toEqual([
      "staff",
      "events",
      "sermons",
      "users",
    ]);
  });

  it("carries the staff, events and users seeds in order", () => {
    expect(seeds.map((seed) => seed.name)).toEqual([
      "01_staff",
      "02_events",
      "03_users",
    ]);
  });

  it("reads the statuses content passes through from the schema", () => {
    expect(contract.enums.content_status).toEqual([
      "draft",
      "published",
      "archived",
    ]);
  });

  it("reads the roles of the staff from the schema, in the order the site lists them", () => {
    expect(contract.enums.staff_role).toEqual(["pastor", "elder", "staff"]);
  });

  it("reads the admin's user roles from the schema", () => {
    expect(contract.enums.user_role).toEqual(["admin", "editor"]);
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
      "web.staff.list",
    ]);
    expect(names.filter((name) => name.startsWith("admin."))).toHaveLength(22);
    expect(names).toHaveLength(29);
  });
});

describe("web", () => {
  it("lists the staff in their order", async () => {
    const staff = await db.web.staff.list();
    expect(staff).toHaveLength(3);
    expect(staff[0]).toMatchObject({
      id: 1,
      name: "Elder Name",
      role: "elder",
      bio: null,
      photo: null,
      email: null,
      phone: null,
    });
    expect(staff[0]?.summary).toMatch(/^A few words/);
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
  const bio = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: "A pastor's story." }],
      },
    ],
  };

  const member = {
    name: "Pastor Name",
    role: "pastor" as const,
    photo: "https://cdn.example.com/staff/pastor.jpg",
    email: "pastor@example.com",
    status: "published" as const,
  };

  it("creates, reads, updates and deletes a member", async () => {
    const created = await db.admin.staff.create.first(member);
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      summary: null,
      bio: null,
      phone: null,
      photo: member.photo,
      email: member.email,
      status: "published",
    });

    const list = await db.admin.staff.list();
    expect(list.map((row) => row.name)).toEqual([
      "Pastor Name",
      "Elder Name",
      "Elder Name",
      "Elder Name",
    ]);
    expect((await db.web.staff.list())[0]?.name).toBe("Pastor Name");

    const updated = await db.admin.staff.update.first({
      ...member,
      id,
      role: "staff",
      summary: "Serving since 2010.",
      bio,
      photo: null,
      email: null,
      phone: "530-555-0100",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      role: "staff",
      summary: "Serving since 2010.",
      bio,
      photo: null,
      email: null,
      phone: "530-555-0100",
    });
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Pastor Name",
    ]);

    expect(await db.admin.staff.delete({ id })).toBe(1);
    expect(await db.admin.staff.fetch.first({ id })).toBeNull();
    expect(await db.admin.staff.delete({ id })).toBe(0);
  });

  it("keeps a draft or an archived member off the site", async () => {
    const draft = await db.admin.staff.create.first({
      ...member,
      name: "Draft",
      status: "draft",
    });
    const archived = await db.admin.staff.create.first({
      ...member,
      name: "Archived",
      status: "archived",
    });

    expect(await db.admin.staff.list()).toHaveLength(5);
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
    ]);

    await db.admin.staff.update({ ...member, id: draft!.id, name: "Draft" });
    expect((await db.web.staff.list()).map((row) => row.name)).toContain(
      "Draft",
    );

    expect(await db.admin.staff.delete({ id: draft!.id })).toBe(1);
    expect(await db.admin.staff.delete({ id: archived!.id })).toBe(1);
  });

  it("refuses a status or a role that is not one", async () => {
    await expect(
      db.admin.staff.create({ ...member, status: "hidden" as never }),
    ).rejects.toThrow(/status: Invalid option/);
    await expect(
      db.admin.staff.create({ ...member, role: "deacon" as never }),
    ).rejects.toThrow(/role: Invalid option/);
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

describe("admin.users", () => {
  const sub = "104958204857204857204";

  it("adds a user by email and binds them to Google on first sign-in", async () => {
    const created = await db.admin.users.create.first({
      email: "Pastor@Example.com",
      role: "admin",
    });
    expect(created?.email).toBe("pastor@example.com");
    const id = created!.id;

    expect(await db.admin.users.subject.first({ sub })).toBeNull();
    expect(await db.admin.users.fetch.first({ id })).toMatchObject({
      sub: null,
      name: null,
      role: "admin",
      signed_in_at: null,
    });

    const claimed = await db.admin.users.claim.first({
      sub,
      email: "pastor@example.com",
      name: "Pastor Name",
      picture: "https://example.com/pastor.jpg",
    });
    expect(claimed).toMatchObject({ id, role: "admin", name: "Pastor Name" });
    expect(await db.admin.users.subject.first({ sub })).toMatchObject({
      id,
      email: "pastor@example.com",
      role: "admin",
    });
    expect(
      (await db.admin.users.fetch.first({ id }))?.signed_in_at,
    ).toBeInstanceOf(Date);

    expect(
      await db.admin.users.claim.first({
        sub: "other",
        email: "pastor@example.com",
      }),
    ).toBeNull();

    expect(await db.admin.users.delete({ id })).toBe(1);
  });

  it("claims no one for an email nobody added", async () => {
    expect(
      await db.admin.users.claim.first({ sub, email: "stranger@example.com" }),
    ).toBeNull();
    expect(await db.admin.users.subject.first({ sub })).toBeNull();
  });

  it("changes a role, and unbinds a user whose email changes", async () => {
    const created = await db.admin.users.create.first({
      email: "office@example.com",
      role: "editor",
    });
    const id = created!.id;
    await db.admin.users.claim({ sub, email: "office@example.com" });

    await db.admin.users.update({
      id,
      email: "office@example.com",
      role: "admin",
    });
    expect(await db.admin.users.subject.first({ sub })).toMatchObject({
      role: "admin",
    });

    await db.admin.users.update({
      id,
      email: "new@example.com",
      role: "admin",
    });
    expect(await db.admin.users.subject.first({ sub })).toBeNull();
    expect(await db.admin.users.fetch.first({ id })).toMatchObject({
      email: "new@example.com",
      sub: null,
    });

    expect(await db.admin.users.delete({ id })).toBe(1);
  });

  it("refuses an email already added", async () => {
    const created = await db.admin.users.create.first({
      email: "twice@example.com",
      role: "editor",
    });
    expect(
      await refusal(
        db.admin.users.create({ email: "TWICE@example.com", role: "admin" }),
      ),
    ).toMatch(/users_email_key/);
    expect(await db.admin.users.delete({ id: created!.id })).toBe(1);
  });
});

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
      names.filter(
        (name) =>
          !name.startsWith("admin.users.") &&
          /\.(fetch|list|upcoming|weekly)$/.test(name),
      ),
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

  it("keeps the users from web", async () => {
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.users.list", {}),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    await expect(
      web.build.selectFrom("users").selectAll().execute(),
    ).rejects.toThrow(/permission denied for table users/);
  });

  it("writes as admin, with ids the database fills", async () => {
    const created = await admin.admin.staff.create.first({
      name: "Office Name",
      role: "staff",
      status: "draft",
    });
    expect(created?.id).toBeGreaterThan(0);
    expect(
      await admin.admin.staff.fetch.first({ id: created!.id }),
    ).toMatchObject({
      name: "Office Name",
      status: "draft",
    });
    expect(await admin.admin.staff.delete({ id: created!.id })).toBe(1);
  });
});
