import { makeTestBezoar } from "@bezoar/testing";
import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
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
  db = await makeTestBezoar(contract, {
    queries,
    migrations,
    seeds,
    database: { extensions: { fuzzystrmatch, pg_trgm } },
  });
});

afterAll(() => db.close());

describe("the build", () => {
  it("carries the staff, events, sermons, users, staff search, like escape, search cost, staff status, events search, events trim and content migrations in order", () => {
    expect(migrations.map((migration) => migration.name)).toEqual([
      "staff",
      "events",
      "sermons",
      "users",
      "staff_search",
      "like_escape",
      "search_cost",
      "staff_status",
      "events_search",
      "events_trim",
      "content",
    ]);
  });

  it("carries the staff, events, users and content seeds in order", () => {
    expect(seeds.map((seed) => seed.name)).toEqual([
      "01_staff",
      "02_events",
      "03_users",
      "04_content",
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
      "web.content.fetch",
      "web.content.list",
      "web.events.fetch",
      "web.events.list",
      "web.events.upcoming",
      "web.events.weekly",
      "web.sermons.fetch",
      "web.sermons.list",
      "web.staff.list",
    ]);
    expect(names.filter((name) => name.startsWith("admin."))).toHaveLength(32);
    expect(names).toHaveLength(41);
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
      date: "2026-01-04",
      recurring: true,
      weeks: null,
      start_time: "10:00:00",
      end_time: "11:30:00",
      image: null,
    });
    expect(events[2]?.summary).toMatch(/^We gather on Sunday morning/);
    expect(events[2]).not.toHaveProperty("body");
    expect(events[5]).toMatchObject({ slug: "stamp-ministry", weeks: [1, 3] });
    expect(events[6]).not.toHaveProperty("note");
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
      date: "2026-01-08",
      recurring: true,
    });
    // What the seed writes as paragraphs is kept as the tree of them.
    expect(found?.body).toMatchObject({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            {
              type: "text",
              value: expect.stringMatching(/^We set aside time/),
            },
          ],
        },
        { type: "element", tagName: "p" },
      ],
    });
    expect(await db.web.events.fetch.first({ slug: "nope" })).toBeNull();
  });

  it("has no upcoming one-offs and no sermons until admin adds them", async () => {
    expect(await db.web.events.upcoming({ from: "2026-01-01" })).toEqual([]);
    expect(await db.web.sermons.list({ limit: 3 })).toEqual([]);
    expect(await db.web.sermons.fetch.first({ slug: "nope" })).toBeNull();
  });
  it("lists the site's pages by slug", async () => {
    expect((await db.web.content.list()).map((page) => page.slug)).toEqual([
      "about-us",
      "index",
    ]);
  });

  it("reads a page by its slug: its front matter and what is written on it", async () => {
    const home = await db.web.content.fetch.first({ slug: "index" });
    expect(home).toMatchObject({
      slug: "index",
      title: "Butte Bible Fellowship – The Church on Pillsbury Road",
      description: "A non-denominational local church in Chico, California.",
    });
    expect(home).not.toHaveProperty("id");
    // The hero the home page opens with is the interface's, not content.
    expect(home).not.toHaveProperty("hero");
    expect(home?.body).toMatchObject({ type: "root" });

    // The pages whose words are the interface's are not content.
    for (const slug of ["connect", "events", "sermons", "nope"]) {
      expect(await db.web.content.fetch.first({ slug }), slug).toBeNull();
    }
  });

  it("seeds each page as rich text, the site's blocks among its elements", async () => {
    const blocks = async (slug: string) => {
      const page = await db.web.content.fetch.first({ slug });
      const names: string[] = [];
      const walk = (node: {
        properties?: { dataDirective?: string };
        children?: unknown[];
      }) => {
        if (node.properties?.dataDirective !== undefined) {
          names.push(node.properties.dataDirective);
        }
        for (const child of node.children ?? []) walk(child as typeof node);
      };
      walk(page!.body as Parameters<typeof walk>[0]);
      return names;
    };
    expect(await blocks("index")).toEqual([
      "invite-grid",
      "invite-card",
      "invite-card",
      "invite-card",
    ]);
    expect(await blocks("about-us")).toEqual([]);
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
    email: "pastor@example.com",
  };

  const photo = "https://cdn.example.com/staff/pastor.jpg";

  it("creates, reads, updates and deletes a member", async () => {
    const created = await db.admin.staff.create.first(member);
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // A member is created without a photo or a bio: each is set on its own.
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      summary: null,
      bio: null,
      phone: null,
      photo: null,
      email: member.email,
    });
    const portrayed = await db.admin.staff.photo.first({ id, photo });
    expect(portrayed?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      photo,
      email: member.email,
    });
    expect(await db.admin.staff.photo.first({ id: 0, photo })).toBeNull();

    const tz = "America/Los_Angeles";
    const page = { size: 25, offset: 0, tz, sort: "role", direction: "asc" };
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      dateStyle: "short",
    }).format(new Date());
    const list = await db.admin.staff.list(page);
    expect(list.map((row) => row.name)).toEqual([
      "Pastor Name",
      "Elder Name",
      "Elder Name",
      "Elder Name",
    ]);
    expect(list.map((row) => row.total)).toEqual([4, 4, 4, 4]);
    expect((await db.web.staff.list())[0]?.name).toBe("Pastor Name");

    expect(
      (await db.admin.staff.list({ ...page, q: "PASTOR" })).map((r) => r.name),
    ).toEqual(["Pastor Name"]);
    // The text is taken as typed: a wildcard of LIKE is the character itself.
    expect(await db.admin.staff.list({ ...page, q: "%" })).toEqual([]);
    expect(await db.admin.staff.list({ ...page, q: "_" })).toEqual([]);
    expect(await db.admin.staff.list({ ...page, q: "\\" })).toEqual([]);
    expect(await db.admin.staff.list({ ...page, q: "r N" })).toHaveLength(4);
    expect(
      (await db.admin.staff.list({ ...page, role_is: "elder" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      (await db.admin.staff.list({ ...page, role_not: "elder" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (
        await db.admin.staff.list({
          ...page,
          role_is: "elder",
          role_not: "pastor",
        })
      ).map((r) => r.total),
    ).toEqual([3, 3, 3]);

    // The text is looked for in the email, the phone, the summary and the
    // bio too.
    expect(
      (await db.admin.staff.list({ ...page, q: "@EXAMPLE" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(await db.admin.staff.list({ ...page, q: "how long" })).toHaveLength(
      3,
    );
    expect(await db.admin.staff.list({ ...page, q: "story" })).toEqual([]);
    // Near enough finds a member too: a misspelling, but not another word.
    expect(
      (await db.admin.staff.list({ ...page, q: "Pastor Nme" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.staff.list({ ...page, q: "Eldre Name" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    // Two letters swapped, or one dropped, is within an edit or two of a
    // word, each word typed on its own; a word of four letters gets one edit.
    // Only where nothing is in or near the text: a word typed right finds
    // its members, and a misspelled one beside it widens nothing.
    expect(
      (await db.admin.staff.list({ ...page, q: "Edler" })).map((r) => r.name),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      (await db.admin.staff.list({ ...page, q: "Eldr" })).map((r) => r.name),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(await db.admin.staff.list({ ...page, q: "Eldr Nmae" })).toEqual([]);
    expect(
      (await db.admin.staff.list({ ...page, q: "Pastor Edler" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(await db.admin.staff.list({ ...page, q: "Deacon" })).toEqual([]);
    expect(await db.admin.staff.list({ ...page, q: "Bob" })).toEqual([]);

    // A text column held or not, whatever the case: the value, or whether
    // the column is filled in, an empty one counted as missing.
    expect(
      (await db.admin.staff.list({ ...page, photo_is: "present" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.staff.list({ ...page, photo_not: "missing" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.staff.list({ ...page, email_is: "missing" }),
    ).toHaveLength(3);
    expect(
      await db.admin.staff.list({ ...page, email_not: "present" }),
    ).toHaveLength(3);
    expect(
      await db.admin.staff.list({ ...page, summary_is: "missing" }),
    ).toHaveLength(1);
    expect(await db.admin.staff.list({ ...page, phone_is: "present" })).toEqual(
      [],
    );
    expect(
      (await db.admin.staff.list({ ...page, name_is: "PASTOR NAME" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.staff.list({ ...page, name_is: "Pastor" })).map(
        (r) => r.name,
      ),
    ).toEqual([]);
    expect(
      (await db.admin.staff.list({ ...page, name_not: "elder name" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    // A column left empty is not what it does not hold.
    expect(
      await db.admin.staff.list({ ...page, email_not: "pastor@example.com" }),
    ).toHaveLength(3);
    // The text a column carries, or does not, or starts or ends with, as
    // typed: a wildcard of LIKE is the character itself.
    expect(
      (await db.admin.staff.list({ ...page, name_contains: "STOR" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(await db.admin.staff.list({ ...page, email_contains: "%" })).toEqual(
      [],
    );
    expect(await db.admin.staff.list({ ...page, name_contains: "_" })).toEqual(
      [],
    );
    expect(
      (await db.admin.staff.list({ ...page, name_not_contains: "Past" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      await db.admin.staff.list({ ...page, email_not_contains: "example" }),
    ).toHaveLength(3);
    expect(
      (await db.admin.staff.list({ ...page, name_starts_with: "pa" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.staff.list({ ...page, name_starts_with: "ame" }),
    ).toEqual([]);
    expect(
      await db.admin.staff.list({ ...page, name_ends_with: "ame" }),
    ).toHaveLength(4);
    expect(
      (await db.admin.staff.list({ ...page, photo_ends_with: ".JPG" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.staff.list({ ...page, summary_contains: "elder" }),
    ).toHaveLength(3);
    expect(
      await db.admin.staff.list({
        ...page,
        summary_starts_with: "A few",
        summary_ends_with: "fellowship.",
        name_is: "elder name",
      }),
    ).toHaveLength(3);
    await db.admin.staff.update({
      id,
      ...member,
      summary: null,
      phone: "",
    });
    expect(await db.admin.staff.list({ ...page, phone_is: "present" })).toEqual(
      [],
    );
    expect(
      await db.admin.staff.list({ ...page, phone_is: "missing" }),
    ).toHaveLength(4);
    expect(
      await db.admin.staff.list({ ...page, phone_not: "missing" }),
    ).toEqual([]);
    // A page is `size` rows from `offset`, each carrying the whole count.
    expect(
      (await db.admin.staff.list({ ...page, size: 2, offset: 2 })).map(
        (r) => r.total,
      ),
    ).toEqual([4, 4]);
    expect(await db.admin.staff.list({ ...page, size: 2, offset: 4 })).toEqual(
      [],
    );

    expect(
      await db.admin.staff.list({ ...page, created_on: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.staff.list({ ...page, updated_before: today }),
    ).toEqual([]);
    expect(
      await db.admin.staff.list({ ...page, updated_after: today }),
    ).toEqual([]);
    expect(
      await db.admin.staff.list({ ...page, created_before: today }),
    ).toEqual([]);
    expect(
      await db.admin.staff.list({ ...page, created_on_or_after: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.staff.list({ ...page, updated_on_or_before: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.staff.list({
        ...page,
        created_on_or_after: today,
        created_on_or_before: today,
      }),
    ).toHaveLength(4);
    expect(
      await db.admin.staff.list({
        ...page,
        updated_on_or_after: "2000-01-01",
        updated_on_or_before: "2000-12-31",
      }),
    ).toEqual([]);

    // The sort asked for, a null last either way, then the site's order.
    expect(
      (await db.admin.staff.list({ ...page, direction: "desc" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name", "Pastor Name"]);
    expect(
      (await db.admin.staff.list({ ...page, sort: "name" })).map((r) => r.name),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name", "Pastor Name"]);
    expect(
      (
        await db.admin.staff.list({ ...page, sort: "name", direction: "desc" })
      ).map((r) => r.name),
    ).toEqual(["Pastor Name", "Elder Name", "Elder Name", "Elder Name"]);
    for (const direction of ["asc", "desc"]) {
      expect(
        (await db.admin.staff.list({ ...page, sort: "email", direction })).map(
          (r) => r.email,
        ),
      ).toEqual(["pastor@example.com", null, null, null]);
    }
    expect(
      (
        await db.admin.staff.list({
          ...page,
          sort: "created_at",
          direction: "desc",
        })
      ).map((r) => r.name),
    ).toEqual(["Pastor Name", "Elder Name", "Elder Name", "Elder Name"]);

    const updated = await db.admin.staff.update.first({
      ...member,
      id,
      role: "staff",
      summary: "Serving since 2010.",
      email: null,
      phone: "530-555-0100",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    // An update replaces the member's details, and leaves the photo and
    // the bio as they were.
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      role: "staff",
      summary: "Serving since 2010.",
      bio: null,
      photo,
      email: null,
      phone: "530-555-0100",
    });
    const written = await db.admin.staff.bio.first({ id, bio });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect((await db.admin.staff.photo.first({ id, photo: null }))?.id).toBe(
      id,
    );
    expect(await db.admin.staff.fetch.first({ id })).toMatchObject({
      role: "staff",
      summary: "Serving since 2010.",
      bio,
      photo: null,
    });
    expect(await db.admin.staff.bio.first({ id: 0, bio })).toBeNull();
    // The bio's text and the phone are searched once they are written.
    expect(
      (await db.admin.staff.list({ ...page, q: "pastor's story" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.staff.list({ ...page, q: "555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);

    // Without a sort, a search lists the nearest first: the exact match
    // before the near one, though the site's order would put it after.
    const near = await db.admin.staff.create.first({
      ...member,
      name: "Near Name",
      phone: "530-555-0101",
    });
    const unsorted = { ...page, sort: null };
    expect(
      (await db.admin.staff.list({ ...unsorted, q: "530-555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name", "Near Name"]);
    expect(
      (await db.admin.staff.list({ ...page, q: "530-555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Near Name", "Pastor Name"]);
    expect((await db.admin.staff.list(unsorted)).map((r) => r.name)).toEqual([
      "Near Name",
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Pastor Name",
    ]);
    await db.admin.staff.delete({ id: near!.id });
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

  it("carries no status: a member written is on the site", async () => {
    const created = await db.admin.staff.create.first({
      name: "Office Name",
      role: "staff",
    });
    expect(
      await db.admin.staff.fetch.first({ id: created!.id }),
    ).not.toHaveProperty("status");
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Office Name",
    ]);
    expect(await db.admin.staff.delete({ id: created!.id })).toBe(1);
  });

  it("refuses a role that is not one", async () => {
    await expect(
      db.admin.staff.create({ ...member, role: "deacon" as never }),
    ).rejects.toThrow(/role: Invalid option/);
  });
});

describe("admin.content", () => {
  /* The whole list, in the admin's own order: one page big enough. */
  const tz = "America/Los_Angeles";
  const page = { size: 25, offset: 0, tz, direction: "asc" };

  const SEEDED = ["about-us", "index"];

  const article = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { dataDirective: "invite-card" },
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [
              { type: "text", value: "Membership at the fellowship." },
            ],
          },
        ],
      },
    ],
  };

  const slugs = async (
    search: Partial<Parameters<typeof db.admin.content.list>[0]>,
  ) =>
    (await db.admin.content.list({ ...page, ...search })).map(
      (row) => row.slug,
    );

  it("creates a page, which the web reads, and writes what is on it on its own", async () => {
    const created = await db.admin.content.create.first({
      slug: "membership",
      title: "Membership – Butte Bible Fellowship",
    });
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // A page is created with its metadata alone: its body is set on its own.
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      slug: "membership",
      description: null,
      body: null,
    });
    expect((await db.web.content.list()).map((row) => row.slug)).toContain(
      "membership",
    );

    const written = await db.admin.content.body.first({ id, body: article });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect(
      await db.admin.content.body.first({ id: 0, body: article }),
    ).toBeNull();

    // An update replaces the metadata, and leaves the body.
    const updated = await db.admin.content.update.first({
      id,
      slug: "membership",
      title: "Belonging – Butte Bible Fellowship",
      description: "How to join the fellowship.",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      title: "Belonging – Butte Bible Fellowship",
      description: "How to join the fellowship.",
      body: article,
    });
    expect(await db.web.content.fetch.first({ slug: "membership" })).toEqual({
      slug: "membership",
      title: "Belonging – Butte Bible Fellowship",
      description: "How to join the fellowship.",
      body: article,
    });

    // The free text reads the body's words, with the rest, the page that
    // carries the text before any that only comes near it.
    expect((await slugs({ q: "how to join" }))[0]).toBe("membership");
    expect((await slugs({ q: "membership at the fellowship" }))[0]).toBe(
      "membership",
    );

    await db.admin.content.body({ id, body: null });
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      body: null,
    });

    expect(await db.admin.content.delete({ id })).toBe(1);
    expect(await db.admin.content.fetch.first({ id })).toBeNull();
    expect(await db.admin.content.delete({ id })).toBe(0);
    expect(await db.web.content.fetch.first({ slug: "membership" })).toBeNull();
  });

  it("refuses a slug already taken", async () => {
    expect(
      await refusal(
        db.admin.content.create({ slug: "index", title: "Another home" }),
      ),
    ).toMatch(/content_slug_key/);
  });

  it("lists a page of the pages, searched, filtered and sorted", async () => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      dateStyle: "short",
    }).format(new Date());

    // In the admin's own order, by slug, each row with the whole count.
    const listed = await db.admin.content.list(page);
    expect(listed.map((row) => row.slug)).toEqual(SEEDED);
    expect(listed.every((row) => row.total === 2)).toBe(true);
    expect(listed[0]).toHaveProperty("body");
    expect(listed[0]).not.toHaveProperty("search");

    // A window of it.
    expect(await slugs({ size: 1, offset: 1 })).toEqual(["index"]);
    expect(
      (await db.admin.content.list({ ...page, size: 1, offset: 1 }))[0]?.total,
    ).toBe(2);

    // The free text: a title, a slug, a description and the body's words, whatever the case, the page that carries the text first,
    // and near enough when misspelled.
    const nearest = async (q: string) => (await slugs({ q }))[0];
    expect(await nearest("ABOUT-US")).toBe("about-us");
    expect(await nearest("non-denominational local church")).toBe("index");
    expect(await nearest("curious about christianity")).toBe("index");
    expect(await nearest("core beleifs")).toBe("about-us");
    expect(await slugs({ q: "100%" })).toEqual([]);
    expect(await slugs({ q: "zzzz" })).toEqual([]);

    // The text filters, on each text column.
    expect(await slugs({ title_starts_with: "about" })).toEqual(["about-us"]);
    expect(await slugs({ title_contains: "– butte bible" })).toEqual([
      "about-us",
    ]);
    expect(await slugs({ title_not_contains: "– butte bible" })).toEqual([
      "index",
    ]);
    expect(await slugs({ slug_is: "INDEX" })).toEqual(["index"]);
    expect(await slugs({ slug_not: "index" })).toEqual(["about-us"]);
    expect(await slugs({ slug_ends_with: "s" })).toEqual(["about-us"]);
    expect(await slugs({ description_contains: "chico" })).toEqual(["index"]);
    expect(await slugs({ description_is: "present" })).toEqual(SEEDED);
    expect(await slugs({ description_is: "missing" })).toEqual([]);
    expect(await slugs({ description_not: "present" })).toEqual([]);

    // The day filters, read in the church's time zone.
    expect(await slugs({ updated_on: today })).toEqual(SEEDED);
    expect(await slugs({ updated_before: today })).toEqual([]);
    expect(await slugs({ created_on_or_after: today })).toEqual(SEEDED);
    expect(await slugs({ created_after: today })).toEqual([]);

    // A sort, either way, and the admin's own order after it.
    expect(await slugs({ sort: "title" })).toEqual(["about-us", "index"]);
    expect(await slugs({ sort: "title", direction: "desc" })).toEqual([
      "index",
      "about-us",
    ]);
    expect(await slugs({ sort: "slug", direction: "desc" })).toEqual(
      [...SEEDED].reverse(),
    );
    expect(await slugs({ sort: "updated_at", direction: "desc" })).toEqual(
      SEEDED,
    );

    // Filters narrow together.
    expect(
      await slugs({ q: "butte", slug_ends_with: "s", title_not: "nothing" }),
    ).toEqual(["about-us"]);
  });
});

describe("admin.events", () => {
  /* The whole list, in the admin's own order: one page big enough. */
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
        children: [{ type: "text", value: "A morning on the grounds." }],
      },
    ],
  };

  const WEEKLY = [
    "adult-sunday-school",
    "fellowship-time",
    "worship-service",
    "mens-breakfast-bible-study",
    "womens-bible-study",
    "stamp-ministry",
    "prayer-meeting",
    "volunteer-work-fellowship",
  ];

  it("creates a one-off, which the web lists as upcoming, and writes its picture and what is said of it each on its own", async () => {
    const created = await db.admin.events.create.first({
      slug: "christmas-eve",
      title: "Christmas Eve Service",
      date: "2026-12-24",
      recurring: false,
      start: "18:00",
    });
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // An event is created without a picture or a body: each is set on its own.
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      summary: null,
      body: null,
      image: null,
      date: "2026-12-24",
      recurring: false,
      weeks: null,
      end_time: null,
    });
    expect(await db.admin.events.fetch.first({ id })).not.toHaveProperty(
      "status",
    );

    expect(await db.web.events.upcoming({ from: "2026-12-01" })).toEqual([
      expect.objectContaining({
        slug: "christmas-eve",
        date: "2026-12-24",
        start_time: "18:00:00",
        end_time: null,
      }),
    ]);
    expect(await db.web.events.upcoming({ from: "2026-12-25" })).toEqual([]);
    expect(
      (await db.web.events.list({ from: "2026-12-01" })).map((e) => e.slug),
    ).toEqual([...WEEKLY, "christmas-eve"]);
    expect(
      (await db.web.events.list({ from: "2026-12-25" })).map((e) => e.slug),
    ).toEqual(WEEKLY);

    const image = "https://cdn.example.com/events/christmas-eve.jpg";
    const pictured = await db.admin.events.image.first({ id, image });
    expect(pictured?.updated_at).toBeInstanceOf(Date);
    const written = await db.admin.events.body.first({ id, body: article });
    expect(written?.id).toBe(id);
    expect(await db.admin.events.image.first({ id: 0, image })).toBeNull();
    expect(
      await db.admin.events.body.first({ id: 0, body: article }),
    ).toBeNull();

    // An update replaces the details, and leaves the picture and the body.
    const updated = await db.admin.events.update.first({
      id,
      slug: "christmas-eve",
      title: "Advent Evening",
      summary: "An evening a week through Advent.",
      date: "2026-12-02",
      recurring: true,
      weeks: [1, 2, 3, 4],
      start: "18:00",
      end: "19:00",
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      title: "Advent Evening",
      summary: "An evening a week through Advent.",
      body: article,
      image,
      date: "2026-12-02",
      recurring: true,
      weeks: [1, 2, 3, 4],
      end_time: "19:00:00",
    });
    expect(await db.web.events.upcoming({ from: "2026-12-01" })).toEqual([]);
    expect((await db.web.events.weekly()).map((event) => event.slug)).toContain(
      "christmas-eve",
    );
    expect(await db.web.events.fetch.first({ slug: "christmas-eve" })).toEqual(
      expect.objectContaining({ body: article, image }),
    );

    expect((await db.admin.events.image.first({ id, image: null }))?.id).toBe(
      id,
    );
    await db.admin.events.body({ id, body: null });
    expect(await db.admin.events.fetch.first({ id })).toMatchObject({
      body: null,
      image: null,
    });

    expect(await db.admin.events.delete({ id })).toBe(1);
    expect(await db.admin.events.fetch.first({ id })).toBeNull();
    expect(await db.admin.events.delete({ id })).toBe(0);
  });

  it("lists a page of the events, searched, filtered and sorted", async () => {
    const tz = "America/Los_Angeles";
    const page = { size: 25, offset: 0, tz, direction: "asc" };
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      dateStyle: "short",
    }).format(new Date());
    const slugs = async (
      search: Partial<Parameters<typeof db.admin.events.list>[0]>,
    ) =>
      (await db.admin.events.list({ ...page, ...search })).map(
        (row) => row.slug,
      );

    const created = await db.admin.events.create.first({
      slug: "harvest-supper",
      title: "Harvest Supper",
      summary: "Bring gloves",
      date: "2026-10-17",
      recurring: false,
      start: "08:00",
    });
    const id = created!.id;
    await db.admin.events.body({ id, body: article });
    await db.admin.events.image({
      id,
      image: "https://cdn.example.com/events/harvest-supper.jpg",
    });

    // The admin's own order: the recurring ones Sunday first, then the
    // one-offs by date. Every row carries the whole count.
    const list = await db.admin.events.list(page);
    expect(list.map((row) => row.slug)).toEqual([...WEEKLY, "harvest-supper"]);
    expect(list.map((row) => row.total)).toEqual(Array(9).fill(9));
    expect(list[8]).toMatchObject({
      id,
      body: article,
      date: "2026-10-17",
      recurring: false,
      start_time: "08:00:00",
    });
    expect(list[8]).not.toHaveProperty("search");

    // A page is `size` rows from `offset`.
    expect(await slugs({ size: 2, offset: 2 })).toEqual(WEEKLY.slice(2, 4));
    expect(
      (await db.admin.events.list({ ...page, size: 2, offset: 8 })).map(
        (row) => row.total,
      ),
    ).toEqual([9]);
    expect(await slugs({ size: 2, offset: 10 })).toEqual([]);

    // The free text is looked for in the title, the slug, the summary and
    // the text of the body, as typed.
    expect(await slugs({ q: "HARVEST SUPPER" })).toEqual(["harvest-supper"]);
    expect(await slugs({ q: "gloves" })).toEqual(["harvest-supper"]);
    expect(await slugs({ q: "morning on the grounds" })).toEqual([
      "harvest-supper",
    ]);
    expect(await slugs({ q: "mens-breakfast" })).toEqual([
      "mens-breakfast-bible-study",
    ]);
    expect(await slugs({ q: "cdn.example.com" })).toEqual([]);
    expect(await slugs({ q: "%" })).toEqual([]);
    expect(await slugs({ q: "_" })).toEqual([]);
    // Near enough finds an event too: a misspelling, but not another word.
    expect(await slugs({ q: "Harvst Suppr" })).toEqual(["harvest-supper"]);
    expect(await slugs({ q: "Zeppelin" })).toEqual([]);

    // Whether an event recurs, and the day of the week its date falls on.
    expect(await slugs({ recurring_is: false })).toEqual(["harvest-supper"]);
    expect(await slugs({ recurring_not: false })).toEqual(WEEKLY);
    expect(await slugs({ recurring_is: true })).toEqual(WEEKLY);
    expect(await slugs({ day_is: "tuesday" })).toEqual(WEEKLY.slice(3, 6));
    expect(await slugs({ day_is: "saturday" })).toEqual(["harvest-supper"]);
    expect(await slugs({ day_not: "sunday" })).toEqual([
      ...WEEKLY.slice(3),
      "harvest-supper",
    ]);
    expect(await slugs({ day_is: "thursday", day_not: "thursday" })).toEqual(
      [],
    );

    // A text column held or not, whatever the case, or whether it is
    // filled in; and the text it carries, or does not, starts or ends with.
    expect(await slugs({ title_is: "harvest supper" })).toEqual([
      "harvest-supper",
    ]);
    expect(await slugs({ title_is: "harvest" })).toEqual([]);
    expect(await slugs({ title_not: "Harvest Supper" })).toEqual(WEEKLY);
    expect(await slugs({ image_is: "present" })).toEqual(["harvest-supper"]);
    expect(await slugs({ image_not: "missing" })).toEqual(["harvest-supper"]);
    expect(await slugs({ image_is: "missing" })).toEqual(WEEKLY);
    // A column left empty is not what it does not hold or carry.
    expect(await slugs({ image_not_contains: "cdn" })).toEqual(WEEKLY);
    expect(await slugs({ title_contains: "BIBLE" })).toEqual([
      "mens-breakfast-bible-study",
      "womens-bible-study",
    ]);
    expect(await slugs({ title_contains: "%" })).toEqual([]);
    expect(await slugs({ slug_starts_with: "harvest" })).toEqual([
      "harvest-supper",
    ]);
    expect(await slugs({ slug_ends_with: "-STUDY" })).toEqual([
      "mens-breakfast-bible-study",
      "womens-bible-study",
    ]);
    expect(await slugs({ summary_starts_with: "We gather" })).toEqual([
      "worship-service",
    ]);
    expect(await slugs({ image_ends_with: ".jpg" })).toEqual([
      "harvest-supper",
    ]);
    expect(
      await slugs({ title_contains: "study", slug_starts_with: "womens" }),
    ).toEqual(["womens-bible-study"]);

    // The date an event is held, as written.
    expect(await slugs({ date_on: "2026-10-17" })).toEqual(["harvest-supper"]);
    expect(await slugs({ date_before: "2026-01-06" })).toEqual(
      WEEKLY.slice(0, 3),
    );
    expect(await slugs({ date_after: "2026-10-17" })).toEqual([]);
    expect(await slugs({ date_on_or_after: "2026-10-17" })).toEqual([
      "harvest-supper",
    ]);
    expect(await slugs({ date_on_or_before: "2026-01-04" })).toEqual(
      WEEKLY.slice(0, 3),
    );
    expect(
      await slugs({
        date_on_or_after: "2026-10-01",
        date_on_or_before: "2026-10-31",
      }),
    ).toEqual(["harvest-supper"]);

    // The day an event was changed or added, in the time zone given.
    expect(await slugs({ created_on: today })).toHaveLength(9);
    expect(await slugs({ updated_before: today })).toEqual([]);
    expect(await slugs({ updated_after: today })).toEqual([]);
    expect(await slugs({ created_on_or_after: today })).toHaveLength(9);
    expect(await slugs({ updated_on_or_before: today })).toHaveLength(9);

    // The sort asked for, a null last either way, then the admin's order.
    expect(await slugs({ sort: "title" })).toEqual([
      "adult-sunday-school",
      "fellowship-time",
      "harvest-supper",
      "mens-breakfast-bible-study",
      "prayer-meeting",
      "stamp-ministry",
      "volunteer-work-fellowship",
      "womens-bible-study",
      "worship-service",
    ]);
    expect((await slugs({ sort: "slug", direction: "desc" }))[0]).toBe(
      "worship-service",
    );
    expect((await slugs({ sort: "recurring" }))[0]).toBe("harvest-supper");
    expect(await slugs({ sort: "recurring", direction: "desc" })).toEqual([
      ...WEEKLY,
      "harvest-supper",
    ]);
    // By day, the week runs Sunday to Saturday, whatever the date.
    expect(await slugs({ sort: "day", direction: "desc" })).toEqual([
      "harvest-supper",
      "prayer-meeting",
      "volunteer-work-fellowship",
      "mens-breakfast-bible-study",
      "womens-bible-study",
      "stamp-ministry",
      "adult-sunday-school",
      "fellowship-time",
      "worship-service",
    ]);
    expect((await slugs({ sort: "date", direction: "desc" }))[0]).toBe(
      "harvest-supper",
    );
    expect((await slugs({ sort: "date" })).slice(0, 3)).toEqual(
      WEEKLY.slice(0, 3),
    );
    expect((await slugs({ sort: "start_time" })).slice(0, 2)).toEqual([
      "mens-breakfast-bible-study",
      "harvest-supper",
    ]);
    expect((await slugs({ sort: "start_time", direction: "desc" }))[0]).toBe(
      "stamp-ministry",
    );
    expect((await slugs({ sort: "created_at", direction: "desc" }))[0]).toBe(
      "harvest-supper",
    );
    // A column the query does not sort by is no sort: the admin's order.
    expect(await slugs({ sort: "body" })).toEqual([
      ...WEEKLY,
      "harvest-supper",
    ]);

    // Without a sort, a search lists the nearest first: the event the text
    // is in before one it is only near, though the order would differ.
    const near = await db.admin.events.create.first({
      slug: "a-harvest",
      title: "Harvest Suppr",
      date: "2026-01-04",
      recurring: true,
      start: "06:00",
    });
    expect(await slugs({ q: "Harvest Supper" })).toEqual([
      "harvest-supper",
      "a-harvest",
    ]);
    expect(await slugs({ q: "Harvest Supper", sort: "slug" })).toEqual([
      "a-harvest",
      "harvest-supper",
    ]);
    expect(await db.admin.events.delete({ id: near!.id })).toBe(1);

    // The search text keeps in step with what is written.
    await db.admin.events.update({
      id,
      slug: "harvest-supper",
      title: "Orchard Cleanup",
      date: "2026-10-17",
      recurring: false,
      start: "08:00",
    });
    await db.admin.events.body({ id, body: null });
    expect(await slugs({ q: "gloves" })).toEqual([]);
    expect(await slugs({ q: "morning on the grounds" })).toEqual([]);
    expect(await slugs({ q: "orchard cleanup" })).toEqual(["harvest-supper"]);

    expect(await db.admin.events.delete({ id })).toBe(1);
    expect(await slugs({})).toEqual(WEEKLY);
  });

  it("creates a recurring event, with null weeks meaning every week, listed by the day of the week of its date", async () => {
    const every = await db.admin.events.create.first({
      slug: "choir",
      title: "Choir Practice",
      // A Monday, months after the seeds' week: the day is what orders it.
      date: "2026-06-08",
      recurring: true,
      start: "19:00",
      end: "20:30",
    });
    expect(await db.admin.events.fetch.first({ id: every!.id })).toMatchObject({
      date: "2026-06-08",
      recurring: true,
      weeks: null,
    });

    const some = await db.admin.events.create.first({
      slug: "youth-group",
      title: "Youth Group",
      date: "2026-01-09",
      recurring: true,
      weeks: [2, 4],
      start: "18:30",
    });
    expect(await db.admin.events.fetch.first({ id: some!.id })).toMatchObject({
      weeks: [2, 4],
      end_time: null,
    });

    const ordered = [
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
    ];
    const list = await db.admin.events.list(all);
    expect(list.map((event) => event.slug)).toEqual(ordered);
    expect((await db.web.events.weekly()).map((e) => e.slug)).toEqual(ordered);
    expect(
      (await db.web.events.list({ from: "2026-01-01" })).map((e) => e.slug),
    ).toEqual(ordered);

    expect(await db.admin.events.delete({ id: every!.id })).toBe(1);
    expect(await db.admin.events.delete({ id: some!.id })).toBe(1);
  });

  it("refuses what the schema rules out", async () => {
    const base = {
      slug: "bad",
      title: "Bad",
      date: "2026-12-24",
      recurring: false,
      start: "10:00",
    };
    expect(
      await refusal(db.admin.events.create({ ...base, weeks: [1] })),
    ).toMatch(/events_weeks_recur/);
    expect(
      await refusal(
        db.admin.events.create({ ...base, recurring: true, weeks: [6] }),
      ),
    ).toMatch(/events_weeks_range/);
    expect(
      await refusal(db.admin.events.create({ ...base, end: "09:00" })),
    ).toMatch(/events_end_after_start/);
    expect(
      await refusal(
        db.admin.events.create({ ...base, slug: "worship-service" }),
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
        database: { extensions: { fuzzystrmatch, pg_trgm } },
      }),
      makeTestBezoar(contract, {
        queries,
        migrations,
        seeds,
        roles,
        role: "admin",
        database: { extensions: { fuzzystrmatch, pg_trgm } },
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
    expect(await web.web.content.list()).toHaveLength(2);
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

  it("refuses a write of a page as web, by name and in the database", async () => {
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.content.delete", { id: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    await expect(
      web.build.deleteFrom("content").where("slug", "=", "index").execute(),
    ).rejects.toThrow(/permission denied for table content/);
    expect(await web.web.content.fetch.first({ slug: "index" })).not.toBeNull();
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
    });
    expect(created?.id).toBeGreaterThan(0);
    expect(
      await admin.admin.staff.fetch.first({ id: created!.id }),
    ).toMatchObject({ name: "Office Name" });
    expect(await admin.admin.staff.delete({ id: created!.id })).toBe(1);
  });
});
