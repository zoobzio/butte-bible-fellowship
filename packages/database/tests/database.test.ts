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

/** The constraint a write was refused over, as the driver's error names it. */
const constraint = (call: Promise<unknown>): Promise<string | undefined> =>
  call.then(
    () => "accepted",
    (error: unknown) =>
      (error as { cause?: { constraint?: string } }).cause?.constraint,
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

/** The heading the home page opens with, as the migration writes it. */
const HEADING = "Discover God’s **Love, Grace & Truth**";

describe("the build", () => {
  it("carries the staff, events, sermons, users, staff search, like escape, search cost, staff status, events search, events trim, content, pages, folders, connect, views, documents, appearance, paths, people and changes migrations in order", () => {
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
      "pages",
      "folders",
      "connect",
      "views",
      "documents",
      "appearance",
      "paths",
      "people",
      "changes",
    ]);
  });

  it("carries the people, events and users seeds in order, and none of the content", () => {
    expect(seeds.map((seed) => seed.name)).toEqual([
      "01_people",
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

  it("reads the roles of the people from the schema, in the order they are listed, the members last", () => {
    expect(contract.enums).not.toHaveProperty("staff_role");
    expect(contract.enums.person_role).toEqual([
      "pastor",
      "elder",
      "staff",
      "member",
    ]);
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
      "web.about.fetch",
      "web.appearance.fetch",
      "web.connect.fetch",
      "web.content.fetch",
      "web.content.list",
      "web.events.fetch",
      "web.events.list",
      "web.events.upcoming",
      "web.events.weekly",
      "web.home.fetch",
      "web.sermons.fetch",
      "web.sermons.list",
      "web.staff.list",
    ]);
    expect(names.filter((name) => name.startsWith("admin."))).toHaveLength(57);
    expect(names).toHaveLength(70);
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
  it("holds no content until the admin writes a page", async () => {
    expect(await db.web.content.list()).toEqual([]);
    // The pages with a table of their own are not content, and neither are
    // the pages whose words are the interface's.
    for (const slug of ["index", "about-us", "connect", "events", "nope"]) {
      expect(await db.web.content.fetch.first({ slug }), slug).toBeNull();
    }
  });

  it("reads the home page: its front matter, its hero and what is written on it", async () => {
    const home = await db.web.home.fetch.first();
    expect(home).toMatchObject({
      title: "Butte Bible Fellowship – The Church on Pillsbury Road",
      description: "A non-denominational local church in Chico, California.",
      // One line: what stands between asterisks is what the site highlights.
      hero_heading: HEADING,
      hero_description:
        "Join us in connecting people to the life changing presence of Jesus Christ, and in the pursuit of His character.",
      hero_action: "Learn More",
      hero_link: "/about-us",
      // No picture uploaded yet: the site's own stands in.
      hero_image: null,
    });
    expect(home).not.toHaveProperty("id");
    expect(home).not.toHaveProperty("updated_at");
    expect(home?.body).toMatchObject({ type: "root" });
    expect(await db.web.home.fetch()).toHaveLength(1);
  });

  it("reads About Us: the title and description it opens with, and what is written on it", async () => {
    const about = await db.web.about.fetch.first();
    expect(about).toMatchObject({
      title: "About Us",
      description:
        "A clean canvas: passing the baton to a new generation of Christ followers.",
    });
    expect(Object.keys(about!).sort()).toEqual([
      "body",
      "description",
      "title",
    ]);
    expect(about?.body).toMatchObject({ type: "root" });
    expect(await db.web.about.fetch()).toHaveLength(1);
  });

  it("reads the connect page: the header it opens with, how to find and reach the church, and nothing written yet", async () => {
    const connect = await db.web.connect.fetch.first();
    expect(connect).toEqual({
      title: "Connect",
      description:
        "We’d love to meet you. Here are the people to ask for, and how to reach us.",
      address: "2255 Pillsbury Road, Chico, California 95926",
      phone: "530-892-0521",
      fax: "530-898-1851",
      email: "office@bbfchurchchico.org",
      // The hours the office keeps: a line of text to a line of the page.
      hours:
        "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon\nSaturday, Sunday, Monday: closed",
      body: null,
    });
    expect(await db.web.connect.fetch()).toHaveLength(1);
  });

  it("reads how the site looks: nothing set over its theme yet", async () => {
    expect(await db.web.appearance.fetch.first()).toEqual({
      patch: {},
      input: {},
    });
    expect(await db.web.appearance.fetch()).toHaveLength(1);
  });

  it("makes each page as rich text, the site's blocks among its elements", async () => {
    const blocks = (body: unknown) => {
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
      walk(body as Parameters<typeof walk>[0]);
      return names;
    };
    expect(blocks((await db.web.home.fetch.first())!.body)).toEqual([
      "invite-grid",
      "invite-card",
      "invite-card",
      "invite-card",
    ]);
    expect(blocks((await db.web.about.fetch.first())!.body)).toEqual([]);
  });
});

describe("admin.people", () => {
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
    first_name: "Pastor",
    last_name: "Name",
    role: "pastor" as const,
    email: "pastor@example.com",
  };

  const photo = "https://cdn.example.com/staff/pastor.jpg";

  it("creates, reads, updates and deletes a person", async () => {
    const created = await db.admin.people.create.first(member);
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // A member is created without a photo or a bio: each is set on its own.
    expect(await db.admin.people.fetch.first({ id })).toMatchObject({
      first_name: "Pastor",
      last_name: "Name",
      name: "Pastor Name",
      title: null,
      address: null,
      birthday: null,
      summary: null,
      bio: null,
      phone: null,
      photo: null,
      email: member.email,
    });
    const portrayed = await db.admin.people.photo.first({ id, photo });
    expect(portrayed?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.people.fetch.first({ id })).toMatchObject({
      photo,
      email: member.email,
    });
    expect(await db.admin.people.photo.first({ id: 0, photo })).toBeNull();

    const tz = "America/Los_Angeles";
    const page = { size: 25, offset: 0, tz, sort: "role", direction: "asc" };
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      dateStyle: "short",
    }).format(new Date());
    const list = await db.admin.people.list(page);
    expect(list.map((row) => row.name)).toEqual([
      "Pastor Name",
      "Elder Name",
      "Elder Name",
      "Elder Name",
    ]);
    expect(list.map((row) => row.total)).toEqual([4, 4, 4, 4]);
    expect((await db.web.staff.list())[0]?.name).toBe("Pastor Name");

    expect(
      (await db.admin.people.list({ ...page, q: "PASTOR" })).map((r) => r.name),
    ).toEqual(["Pastor Name"]);
    // The text is taken as typed: a wildcard of LIKE is the character itself.
    expect(await db.admin.people.list({ ...page, q: "%" })).toEqual([]);
    expect(await db.admin.people.list({ ...page, q: "_" })).toEqual([]);
    expect(await db.admin.people.list({ ...page, q: "\\" })).toEqual([]);
    expect(await db.admin.people.list({ ...page, q: "r N" })).toHaveLength(4);
    expect(
      (await db.admin.people.list({ ...page, role_is: "elder" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      (await db.admin.people.list({ ...page, role_not: "elder" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (
        await db.admin.people.list({
          ...page,
          role_is: "elder",
          role_not: "pastor",
        })
      ).map((r) => r.total),
    ).toEqual([3, 3, 3]);

    // The text is looked for in the email, the phone, the summary and the
    // bio too.
    expect(
      (await db.admin.people.list({ ...page, q: "@EXAMPLE" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(await db.admin.people.list({ ...page, q: "how long" })).toHaveLength(
      3,
    );
    expect(await db.admin.people.list({ ...page, q: "story" })).toEqual([]);
    // Near enough finds a member too: a misspelling, but not another word.
    expect(
      (await db.admin.people.list({ ...page, q: "Pastor Nme" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.people.list({ ...page, q: "Eldre Name" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    // Two letters swapped, or one dropped, is within an edit or two of a
    // word, each word typed on its own; a word of four letters gets one edit.
    // Only where nothing is in or near the text: a word typed right finds
    // its members, and a misspelled one beside it widens nothing.
    expect(
      (await db.admin.people.list({ ...page, q: "Edler" })).map((r) => r.name),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      (await db.admin.people.list({ ...page, q: "Eldr" })).map((r) => r.name),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(await db.admin.people.list({ ...page, q: "Eldr Nmae" })).toEqual([]);
    expect(
      (await db.admin.people.list({ ...page, q: "Pastor Edler" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(await db.admin.people.list({ ...page, q: "Deacon" })).toEqual([]);
    expect(await db.admin.people.list({ ...page, q: "Bob" })).toEqual([]);

    // A text column held or not, whatever the case: the value, or whether
    // the column is filled in, an empty one counted as missing.
    expect(
      (await db.admin.people.list({ ...page, photo_is: "present" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.people.list({ ...page, photo_not: "missing" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.people.list({ ...page, email_is: "missing" }),
    ).toHaveLength(3);
    expect(
      await db.admin.people.list({ ...page, email_not: "present" }),
    ).toHaveLength(3);
    expect(
      await db.admin.people.list({ ...page, summary_is: "missing" }),
    ).toHaveLength(1);
    expect(
      await db.admin.people.list({ ...page, phone_is: "present" }),
    ).toEqual([]);
    expect(
      (await db.admin.people.list({ ...page, name_is: "PASTOR NAME" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.people.list({ ...page, name_is: "Pastor" })).map(
        (r) => r.name,
      ),
    ).toEqual([]);
    expect(
      (await db.admin.people.list({ ...page, name_not: "elder name" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    // A column left empty is not what it does not hold.
    expect(
      await db.admin.people.list({ ...page, email_not: "pastor@example.com" }),
    ).toHaveLength(3);
    // The text a column carries, or does not, or starts or ends with, as
    // typed: a wildcard of LIKE is the character itself.
    expect(
      (await db.admin.people.list({ ...page, name_contains: "STOR" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.people.list({ ...page, email_contains: "%" }),
    ).toEqual([]);
    expect(await db.admin.people.list({ ...page, name_contains: "_" })).toEqual(
      [],
    );
    expect(
      (await db.admin.people.list({ ...page, name_not_contains: "Past" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    expect(
      await db.admin.people.list({ ...page, email_not_contains: "example" }),
    ).toHaveLength(3);
    expect(
      (await db.admin.people.list({ ...page, name_starts_with: "pa" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.people.list({ ...page, name_starts_with: "ame" }),
    ).toEqual([]);
    expect(
      await db.admin.people.list({ ...page, name_ends_with: "ame" }),
    ).toHaveLength(4);
    expect(
      (await db.admin.people.list({ ...page, photo_ends_with: ".JPG" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      await db.admin.people.list({ ...page, summary_contains: "elder" }),
    ).toHaveLength(3);
    expect(
      await db.admin.people.list({
        ...page,
        summary_starts_with: "A few",
        summary_ends_with: "fellowship.",
        name_is: "elder name",
      }),
    ).toHaveLength(3);
    await db.admin.people.update({
      id,
      ...member,
      summary: null,
      phone: "",
    });
    expect(
      await db.admin.people.list({ ...page, phone_is: "present" }),
    ).toEqual([]);
    expect(
      await db.admin.people.list({ ...page, phone_is: "missing" }),
    ).toHaveLength(4);
    expect(
      await db.admin.people.list({ ...page, phone_not: "missing" }),
    ).toEqual([]);
    // A page is `size` rows from `offset`, each carrying the whole count.
    expect(
      (await db.admin.people.list({ ...page, size: 2, offset: 2 })).map(
        (r) => r.total,
      ),
    ).toEqual([4, 4]);
    expect(await db.admin.people.list({ ...page, size: 2, offset: 4 })).toEqual(
      [],
    );

    expect(
      await db.admin.people.list({ ...page, created_on: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.people.list({ ...page, updated_before: today }),
    ).toEqual([]);
    expect(
      await db.admin.people.list({ ...page, updated_after: today }),
    ).toEqual([]);
    expect(
      await db.admin.people.list({ ...page, created_before: today }),
    ).toEqual([]);
    expect(
      await db.admin.people.list({ ...page, created_on_or_after: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.people.list({ ...page, updated_on_or_before: today }),
    ).toHaveLength(4);
    expect(
      await db.admin.people.list({
        ...page,
        created_on_or_after: today,
        created_on_or_before: today,
      }),
    ).toHaveLength(4);
    expect(
      await db.admin.people.list({
        ...page,
        updated_on_or_after: "2000-01-01",
        updated_on_or_before: "2000-12-31",
      }),
    ).toEqual([]);

    // The sort asked for, a null last either way, then the site's order.
    expect(
      (await db.admin.people.list({ ...page, direction: "desc" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name", "Pastor Name"]);
    expect(
      (await db.admin.people.list({ ...page, sort: "name" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name", "Pastor Name"]);
    expect(
      (
        await db.admin.people.list({ ...page, sort: "name", direction: "desc" })
      ).map((r) => r.name),
    ).toEqual(["Pastor Name", "Elder Name", "Elder Name", "Elder Name"]);
    for (const direction of ["asc", "desc"]) {
      expect(
        (await db.admin.people.list({ ...page, sort: "email", direction })).map(
          (r) => r.email,
        ),
      ).toEqual(["pastor@example.com", null, null, null]);
    }
    expect(
      (
        await db.admin.people.list({
          ...page,
          sort: "created_at",
          direction: "desc",
        })
      ).map((r) => r.name),
    ).toEqual(["Pastor Name", "Elder Name", "Elder Name", "Elder Name"]);

    const updated = await db.admin.people.update.first({
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
    expect(await db.admin.people.fetch.first({ id })).toMatchObject({
      role: "staff",
      summary: "Serving since 2010.",
      bio: null,
      photo,
      email: null,
      phone: "530-555-0100",
    });
    const written = await db.admin.people.bio.first({ id, bio });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect((await db.admin.people.photo.first({ id, photo: null }))?.id).toBe(
      id,
    );
    expect(await db.admin.people.fetch.first({ id })).toMatchObject({
      role: "staff",
      summary: "Serving since 2010.",
      bio,
      photo: null,
    });
    expect(await db.admin.people.bio.first({ id: 0, bio })).toBeNull();
    // The bio's text and the phone are searched once they are written.
    expect(
      (await db.admin.people.list({ ...page, q: "pastor's story" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);
    expect(
      (await db.admin.people.list({ ...page, q: "555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name"]);

    // Without a sort, a search lists the nearest first: the exact match
    // before the near one, though the site's order would put it after.
    const near = await db.admin.people.create.first({
      ...member,
      first_name: "Near",
      phone: "530-555-0101",
    });
    const unsorted = { ...page, sort: null };
    expect(
      (await db.admin.people.list({ ...unsorted, q: "530-555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Pastor Name", "Near Name"]);
    expect(
      (await db.admin.people.list({ ...page, q: "530-555-0100" })).map(
        (r) => r.name,
      ),
    ).toEqual(["Near Name", "Pastor Name"]);
    expect((await db.admin.people.list(unsorted)).map((r) => r.name)).toEqual([
      "Near Name",
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Pastor Name",
    ]);
    await db.admin.people.delete({ id: near!.id });
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Pastor Name",
    ]);

    expect(await db.admin.people.delete({ id })).toBe(1);
    expect(await db.admin.people.fetch.first({ id })).toBeNull();
    expect(await db.admin.people.delete({ id })).toBe(0);
  });

  it("carries no status: whoever serves the church is on the site once written", async () => {
    const created = await db.admin.people.create.first({
      first_name: "Office",
      last_name: "Name",
      role: "staff",
    });
    expect(
      await db.admin.people.fetch.first({ id: created!.id }),
    ).not.toHaveProperty("status");
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
      "Office Name",
    ]);
    expect(await db.admin.people.delete({ id: created!.id })).toBe(1);
  });

  it("keeps a member off the site, with all that is kept of them", async () => {
    const created = await db.admin.people.create.first({
      first_name: "Pew",
      last_name: "Abbott",
      role: "member",
      title: "Greeter",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    });
    const id = created!.id;
    expect(await db.admin.people.fetch.first({ id })).toMatchObject({
      name: "Pew Abbott",
      role: "member",
      title: "Greeter",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    });
    expect((await db.web.staff.list()).map((row) => row.name)).toEqual([
      "Elder Name",
      "Elder Name",
      "Elder Name",
    ]);

    const page = {
      size: 25,
      offset: 0,
      tz: "America/Los_Angeles",
      sort: null,
      direction: "asc",
    };
    // The members come after those who serve, and by name is by last name.
    expect((await db.admin.people.list(page)).at(-1)?.name).toBe("Pew Abbott");
    expect(
      (await db.admin.people.list({ ...page, sort: "name" }))[0]?.name,
    ).toBe("Pew Abbott");
    expect(
      (await db.admin.people.list({ ...page, role_not: "member" })).map(
        (row) => row.name,
      ),
    ).toEqual(["Elder Name", "Elder Name", "Elder Name"]);
    // The title and the address are searched and filtered.
    for (const q of ["greeter", "main st"]) {
      expect(
        (await db.admin.people.list({ ...page, q })).map((row) => row.name),
      ).toEqual(["Pew Abbott"]);
    }
    expect(
      (await db.admin.people.list({ ...page, address_contains: "butte" })).map(
        (row) => row.name,
      ),
    ).toEqual(["Pew Abbott"]);
    expect(
      await db.admin.people.list({ ...page, title_is: "present" }),
    ).toHaveLength(1);
    expect(await db.admin.people.delete({ id })).toBe(1);
  });

  it("makes a person a member unless told otherwise", async () => {
    const [row] = await db.build
      .insertInto("people")
      .values({ first_name: "Plain", last_name: "Name" })
      .returning(["id", "role", "name"])
      .execute();
    expect(row).toMatchObject({ role: "member", name: "Plain Name" });
    expect(await db.admin.people.delete({ id: row!.id })).toBe(1);
  });

  it("refuses a role that is not one", async () => {
    await expect(
      db.admin.people.create({ ...member, role: "deacon" as never }),
    ).rejects.toThrow(/role: Invalid option/);
  });
});

describe("admin.content", () => {
  /* The top of the content, in the admin's own order, in the church's time. */
  const top = { direction: "asc", tz: "America/Los_Angeles" };

  /* Two pages to list, written here: the content holds none of its own. */
  const WRITTEN = ["core-beliefs", "welcome"];

  const paragraph = (value: string) => ({
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value }],
      },
    ],
  });

  beforeAll(async () => {
    const welcome = await db.admin.content.create.first({
      slug: "welcome",
      title: "Welcome to the Fellowship",
      description: "A non-denominational local church in Chico, California.",
    });
    await db.admin.content.body({
      id: welcome!.id,
      body: paragraph("Whether you are curious about Christianity or not."),
    });
    const beliefs = await db.admin.content.create.first({
      slug: "core-beliefs",
      title: "Core Beliefs – Butte Bible Fellowship",
      description: "A new community for the cause of Christ.",
    });
    await db.admin.content.body({
      id: beliefs!.id,
      body: paragraph("What the church holds to be true."),
    });
  });

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
    (await db.admin.content.list({ ...top, ...search })).map((row) => row.slug);

  it("creates a page, which the web reads, and writes what is on it on its own", async () => {
    const created = await db.admin.content.create.first({
      slug: "membership",
      title: "Membership – Butte Bible Fellowship",
    });
    expect(created?.created_at).toBeInstanceOf(Date);
    const id = created!.id;

    // A page is created with its metadata alone: its body is set on its own.
    // It is an article, and holds nothing yet.
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      mime: "application/vnd.bbf.article+json",
      slug: "membership",
      description: null,
      body: null,
      size: 0,
    });
    expect((await db.web.content.list()).map((row) => row.slug)).toContain(
      "membership",
    );

    // Its size is written with its body: the bytes of the body as text.
    const written = await db.admin.content.body.first({ id, body: article });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect(written?.size).toBeGreaterThan(
      "Membership at the fellowship.".length,
    );
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
      size: written!.size,
    });
    expect(await db.web.content.fetch.first({ slug: "membership" })).toEqual({
      slug: "membership",
      title: "Belonging – Butte Bible Fellowship",
      description: "How to join the fellowship.",
      body: article,
    });

    await db.admin.content.body({ id, body: null });
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      body: null,
      size: 0,
    });

    expect(await db.admin.content.delete({ id })).toBe(1);
    expect(await db.admin.content.fetch.first({ id })).toBeNull();
    expect(await db.admin.content.delete({ id })).toBe(0);
    expect(await db.web.content.fetch.first({ slug: "membership" })).toBeNull();
  });

  it("is a document of whatever media type it is given, written as one is served", async () => {
    const made = await db.build
      .insertInto("content")
      .values({ slug: "bulletin", title: "Bulletin", mime: "application/pdf" })
      .returning(["id", "mime"])
      .executeTakeFirstOrThrow();
    expect(made.mime).toBe("application/pdf");
    expect(await slugs({ mime_is: "application/pdf" })).toEqual(["bulletin"]);
    expect(await slugs({ mime_starts_with: "application/vnd.bbf" })).toEqual(
      WRITTEN,
    );
    await db.admin.content.delete({ id: made.id });
    for (const mime of ["", "pdf", "Image/PNG", "image/", "image/png; q=1"]) {
      await expect(
        db.build
          .insertInto("content")
          .values({ slug: "refused", title: "Refused", mime })
          .execute(),
        mime,
      ).rejects.toThrow(/content_mime_check/);
    }
  });

  it("refuses a slug already taken", async () => {
    expect(
      await refusal(
        db.admin.content.create({ slug: "welcome", title: "Another welcome" }),
      ),
    ).toMatch(/content_slug_key/);
  });

  it("lists the pages filed in one folder, or at the top, sorted", async () => {
    // At the top, in the admin's own order, by title, each with its body.
    const listed = await db.admin.content.list(top);
    expect(listed.map((row) => row.slug)).toEqual(WRITTEN);
    expect(listed.every((row) => row.folder_id === null)).toBe(true);
    expect(listed[0]).toHaveProperty("body");
    expect(listed[0]).not.toHaveProperty("search");

    // A sort, either way, and the admin's own order after it.
    expect(await slugs({ sort: "title" })).toEqual(WRITTEN);
    expect(await slugs({ sort: "title", direction: "desc" })).toEqual(
      [...WRITTEN].reverse(),
    );
    expect(await slugs({ sort: "slug", direction: "desc" })).toEqual(
      [...WRITTEN].reverse(),
    );
    expect(await slugs({ sort: "slug" })).toEqual(WRITTEN);
    expect(await slugs({ sort: "created_at", direction: "desc" })).toEqual(
      WRITTEN,
    );
    expect(await slugs({ sort: "updated_at" })).toEqual([...WRITTEN].reverse());
    // By size, the shorter body first; by media type, where every page
    // is an article, the admin's own order.
    expect(listed.map((row) => row.size)).toEqual([
      listed[0]!.size,
      listed[0]!.size + 17,
    ]);
    expect(await slugs({ sort: "size" })).toEqual(WRITTEN);
    expect(await slugs({ sort: "size", direction: "desc" })).toEqual(
      [...WRITTEN].reverse(),
    );
    expect(await slugs({ sort: "mime", direction: "desc" })).toEqual(WRITTEN);

    // A folder no page is filed in lists none.
    expect(await slugs({ folder_id: 0 })).toEqual([]);
  });

  it("searches a folder's pages for a text, in all that is written of them, the nearest first", async () => {
    // The title, the slug, the description and the body, whatever the case.
    expect(await slugs({ q: "WELCOME" })).toEqual(["welcome"]);
    expect(await slugs({ q: "core-beliefs" })).toEqual(["core-beliefs"]);
    expect(await slugs({ q: "cause of christ" })).toEqual(["core-beliefs"]);
    expect(await slugs({ q: "curious about" })).toEqual(["welcome"]);
    expect(await slugs({ q: "fellowship" })).toEqual(WRITTEN);
    expect(await slugs({ q: "sermon" })).toEqual([]);
    // What is typed is the text itself, never a wildcard.
    expect(await slugs({ q: "%" })).toEqual([]);
    expect(await slugs({ q: "_" })).toEqual([]);
    // A misspelling still finds its page.
    expect(await slugs({ q: "beleifs" })).toEqual(["core-beliefs"]);
    // A sort asked for holds over the nearness.
    expect(
      await slugs({ q: "fellowship", sort: "title", direction: "desc" }),
    ).toEqual([...WRITTEN].reverse());
    // The folder alone is searched: one that holds nothing finds nothing.
    expect(await slugs({ q: "welcome", folder_id: 0 })).toEqual([]);
  });

  it("filters a folder's pages on the title, the slug, the media type and the day last changed", async () => {
    expect(await slugs({ title_contains: "BELIEFS" })).toEqual([
      "core-beliefs",
    ]);
    expect(await slugs({ title_not_contains: "beliefs" })).toEqual(["welcome"]);
    expect(await slugs({ title_starts_with: "welcome" })).toEqual(["welcome"]);
    expect(await slugs({ title_ends_with: "fellowship" })).toEqual(WRITTEN);
    expect(await slugs({ title_is: "welcome to the fellowship" })).toEqual([
      "welcome",
    ]);
    expect(await slugs({ title_not: "Welcome to the Fellowship" })).toEqual([
      "core-beliefs",
    ]);
    expect(await slugs({ slug_is: "welcome" })).toEqual(["welcome"]);
    expect(await slugs({ slug_not: "welcome" })).toEqual(["core-beliefs"]);
    expect(await slugs({ slug_contains: "-" })).toEqual(["core-beliefs"]);
    expect(await slugs({ slug_not_contains: "-" })).toEqual(["welcome"]);
    expect(await slugs({ slug_starts_with: "core" })).toEqual(["core-beliefs"]);
    expect(await slugs({ slug_ends_with: "come" })).toEqual(["welcome"]);
    // Every page has a title and a slug.
    expect(await slugs({ title_is: "missing" })).toEqual([]);
    expect(await slugs({ slug_is: "present" })).toEqual(WRITTEN);
    // What is typed is the text itself, never a wildcard.
    expect(await slugs({ title_contains: "%" })).toEqual([]);

    // Every page is an article, by its media type, filtered as text is.
    expect(
      await slugs({ mime_is: "application/vnd.bbf.article+json" }),
    ).toEqual(WRITTEN);
    expect(
      await slugs({ mime_not: "application/vnd.bbf.article+json" }),
    ).toEqual([]);
    expect(await slugs({ mime_starts_with: "application/" })).toEqual(WRITTEN);
    expect(await slugs({ mime_starts_with: "image/" })).toEqual([]);
    expect(await slugs({ mime_ends_with: "+JSON" })).toEqual(WRITTEN);
    expect(await slugs({ mime_contains: "article" })).toEqual(WRITTEN);
    expect(await slugs({ mime_not_contains: "article" })).toEqual([]);

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: top.tz,
    }).format(new Date());
    expect(await slugs({ updated_on: today })).toEqual(WRITTEN);
    expect(await slugs({ updated_on_or_after: today })).toEqual(WRITTEN);
    expect(await slugs({ updated_on_or_before: today })).toEqual(WRITTEN);
    expect(await slugs({ updated_before: today })).toEqual([]);
    expect(await slugs({ updated_after: today })).toEqual([]);

    // A filter narrows a search, and another filter.
    expect(await slugs({ q: "fellowship", slug_starts_with: "wel" })).toEqual([
      "welcome",
    ]);
    expect(
      await slugs({ title_contains: "fellowship", slug_contains: "core" }),
    ).toEqual(["core-beliefs"]);
  });

  it("files a page in a folder, and back at the top, and leaves when it was changed", async () => {
    const folder = await db.admin.folders.create.first({ name: "Filed" });
    const id = (await db.admin.content.list(top))[0]!.id;
    const before = await db.admin.content.fetch.first({ id });

    expect(
      await db.admin.content.folder.first({ id, folder_id: folder!.id }),
    ).toEqual({ id, folder_id: folder!.id });
    expect(await slugs({ folder_id: folder!.id })).toEqual(["core-beliefs"]);
    expect(await slugs({})).toEqual(["welcome"]);
    expect(await db.admin.content.fetch.first({ id })).toMatchObject({
      folder_id: folder!.id,
      updated_at: before!.updated_at,
    });

    // A page is written straight into a folder, too.
    const created = await db.admin.content.create.first({
      slug: "filed-at-birth",
      title: "Filed at birth",
      folder_id: folder!.id,
    });
    expect(await slugs({ folder_id: folder!.id })).toEqual([
      "core-beliefs",
      "filed-at-birth",
    ]);
    await db.admin.content.delete({ id: created!.id });

    // Neither a folder that is not there, nor a page that is not.
    expect(
      await refusal(db.admin.content.folder({ id, folder_id: 0 })),
    ).toMatch(/content_folder_id_fkey/);
    expect(
      await db.admin.content.folder.first({ id: 0, folder_id: null }),
    ).toBeNull();

    expect(await db.admin.content.folder.first({ id })).toEqual({
      id,
      folder_id: null,
    });
    expect(await slugs({})).toEqual(WRITTEN);
    await db.admin.folders.delete({ id: folder!.id });
  });
});

describe("admin.folders", () => {
  /* A level in its own order, by name. */
  const level = { direction: "asc" };

  const names = async (
    parent_id?: number,
    order: Partial<Parameters<typeof db.admin.folders.list>[0]> = {},
  ) =>
    (await db.admin.folders.list({ ...level, parent_id, ...order })).map(
      (row) => row.name,
    );

  const paragraph = (value: string) => ({
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value }],
      },
    ],
  });

  it("nests folders, lists each level by name, and counts what each holds", async () => {
    expect(await names()).toEqual([]);

    const sermons = await db.admin.folders.create.first({ name: "Sermons" });
    const news = await db.admin.folders.create.first({ name: "News" });
    expect(sermons?.created_at).toBeInstanceOf(Date);
    const series = await db.admin.folders.create.first({
      name: "Romans",
      parent_id: sermons!.id,
    });
    const deep = await db.admin.folders.create.first({
      name: "Chapter 8",
      parent_id: series!.id,
    });
    const document = await db.admin.content.create.first({
      slug: "no-condemnation",
      title: "No Condemnation",
      folder_id: sermons!.id,
    });

    expect(await names()).toEqual(["News", "Sermons"]);
    expect(await names(sermons!.id)).toEqual(["Romans"]);

    // Searched, a level lists the folders its text names, whatever the
    // case, a misspelling forgiven, and no folder of another level.
    const found = async (q: string, parent_id?: number) =>
      (await db.admin.folders.list({ ...level, q, parent_id })).map(
        (row) => row.name,
      );
    expect(await found("SERM")).toEqual(["Sermons"]);
    expect(await found("s")).toEqual(["News", "Sermons"]);
    expect(await found("sermosn")).toEqual(["Sermons"]);
    expect(await found("romans")).toEqual([]);
    expect(await found("romans", sermons!.id)).toEqual(["Romans"]);
    expect(await found("%")).toEqual([]);
    expect(await names(series!.id)).toEqual(["Chapter 8"]);
    expect(await names(deep!.id)).toEqual([]);

    // A folder counts the folders and the pages it holds itself, and none
    // of what those hold.
    const listed = await db.admin.folders.list(level);
    expect(listed.map((row) => [row.name, row.count])).toEqual([
      ["News", 0],
      ["Sermons", 2],
    ]);
    expect(
      await db.admin.folders.fetch.first({ id: series!.id }),
    ).toMatchObject({ name: "Romans", parent_id: sermons!.id, count: 1 });
    expect(await db.admin.folders.fetch.first({ id: 0 })).toBeNull();

    // A folder is as big as every document under it, however deep, and
    // was changed when the last of them, or of its folders, was.
    const size = async (id: number) =>
      (await db.admin.folders.fetch.first({ id }))!.size;
    const changed = async (id: number) =>
      (await db.admin.folders.fetch.first({ id }))!.updated_at;
    expect(await size(sermons!.id)).toBe(0);
    const made = await changed(news!.id);
    expect(made).toBeInstanceOf(Date);
    const verse = await db.admin.content.create.first({
      slug: "more-than-conquerors",
      title: "More Than Conquerors",
      folder_id: deep!.id,
    });
    const shallow = await db.admin.content.body.first({
      id: document!.id,
      body: paragraph("There is therefore now no condemnation."),
    });
    const buried = await db.admin.content.body.first({
      id: verse!.id,
      body: paragraph("In all these things."),
    });
    expect(await size(deep!.id)).toBe(buried!.size);
    expect(await size(series!.id)).toBe(buried!.size);
    expect(await size(sermons!.id)).toBe(shallow!.size + buried!.size);
    expect(await size(news!.id)).toBe(0);
    expect(await changed(sermons!.id)).toEqual(buried!.updated_at);
    expect(await changed(deep!.id)).toEqual(buried!.updated_at);
    expect(await changed(news!.id)).toEqual(made);
    // The list reads the same of each folder of its level.
    expect(
      (await db.admin.folders.list(level)).map((row) => [
        row.name,
        row.size,
        row.updated_at,
      ]),
    ).toEqual([
      ["News", 0, made],
      ["Sermons", shallow!.size + buried!.size, buried!.updated_at],
    ]);

    // A level sorts by what its folders show under a column, either way,
    // and by name after it.
    expect(await names(undefined, { sort: "name", direction: "desc" })).toEqual(
      ["Sermons", "News"],
    );
    expect(await names(undefined, { sort: "size" })).toEqual([
      "News",
      "Sermons",
    ]);
    expect(await names(undefined, { sort: "size", direction: "desc" })).toEqual(
      ["Sermons", "News"],
    );
    expect(
      await names(undefined, { sort: "updated_at", direction: "desc" }),
    ).toEqual(["Sermons", "News"]);
    expect(await names(undefined, { sort: "updated_at" })).toEqual([
      "News",
      "Sermons",
    ]);
    // By when each was made, which two made at once share: by name then.
    const made_at = (name: string) =>
      listed.find((row) => row.name === name)!.created_at.getTime();
    const oldest = ["News", "Sermons"].sort(
      (a, b) => made_at(a) - made_at(b) || a.localeCompare(b),
    );
    const newest = ["News", "Sermons"].sort(
      (a, b) => made_at(b) - made_at(a) || a.localeCompare(b),
    );
    expect(await names(undefined, { sort: "created_at" })).toEqual(oldest);
    expect(
      await names(undefined, { sort: "created_at", direction: "desc" }),
    ).toEqual(newest);
    await db.admin.content.delete({ id: verse!.id });
    // What is taken out of a folder is no longer counted in it.
    expect(await size(sermons!.id)).toBe(shallow!.size);

    // A name is a folder's own among those beside it, the top's too.
    expect(await refusal(db.admin.folders.create({ name: "News" }))).toMatch(
      /folders_parent_id_name_key/,
    );
    expect(
      await refusal(
        db.admin.folders.create({ name: "Romans", parent_id: sermons!.id }),
      ),
    ).toMatch(/folders_parent_id_name_key/);
    expect(await refusal(db.admin.folders.create({ name: "" }))).toMatch(
      /folders_name_check/,
    );
    // The same name under another folder is another folder's.
    const twin = await db.admin.folders.create.first({
      name: "Romans",
      parent_id: news!.id,
    });

    // Renamed, it stays where it is.
    const renamed = await db.admin.folders.update.first({
      id: series!.id,
      name: "Letter to the Romans",
    });
    expect(renamed?.updated_at).toBeInstanceOf(Date);
    expect(await names(sermons!.id)).toEqual(["Letter to the Romans"]);
    expect(
      await db.admin.folders.update.first({ id: 0, name: "Nothing" }),
    ).toBeNull();

    // Moved, it takes what it holds with it: never into itself, nor under
    // a folder of its own.
    expect(
      await db.admin.folders.parent.first({
        id: sermons!.id,
        parent_id: sermons!.id,
      }),
    ).toBeNull();
    expect(
      await db.admin.folders.parent.first({
        id: sermons!.id,
        parent_id: deep!.id,
      }),
    ).toBeNull();
    expect(
      await db.admin.folders.parent.first({
        id: series!.id,
        parent_id: news!.id,
      }),
    ).toMatchObject({ id: series!.id });
    expect(await names(news!.id)).toEqual(["Letter to the Romans", "Romans"]);
    expect(await names(series!.id)).toEqual(["Chapter 8"]);
    expect(await names(sermons!.id)).toEqual([]);
    // To the top, when no folder is named.
    expect(
      await db.admin.folders.parent.first({ id: series!.id }),
    ).toMatchObject({ id: series!.id });
    expect(await names()).toEqual(["Letter to the Romans", "News", "Sermons"]);
    expect(
      await refusal(db.admin.folders.parent({ id: series!.id, parent_id: 0 })),
    ).toMatch(/folders_parent_id_fkey/);

    // A folder that holds a folder or a page stays; emptied, it goes.
    expect(await db.admin.folders.delete({ id: sermons!.id })).toBe(0);
    expect(await db.admin.folders.delete({ id: series!.id })).toBe(0);
    await db.admin.content.delete({ id: document!.id });
    expect(await db.admin.folders.delete({ id: sermons!.id })).toBe(1);
    expect(await db.admin.folders.delete({ id: deep!.id })).toBe(1);
    expect(await db.admin.folders.delete({ id: series!.id })).toBe(1);
    expect(await db.admin.folders.delete({ id: twin!.id })).toBe(1);
    expect(await db.admin.folders.delete({ id: news!.id })).toBe(1);
    expect(await db.admin.folders.delete({ id: news!.id })).toBe(0);
    expect(await names()).toEqual([]);
  });
});

describe("admin.home", () => {
  const article = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: "Come as you are." }],
      },
    ],
  };

  it("reads the home page, when it was last changed with it", async () => {
    const home = await db.admin.home.fetch.first();
    expect(home).toMatchObject({
      title: "Butte Bible Fellowship – The Church on Pillsbury Road",
      hero_heading: HEADING,
      hero_link: "/about-us",
    });
    expect(home?.updated_at).toBeInstanceOf(Date);
    expect(home).not.toHaveProperty("id");
  });

  it("writes its metadata, its picture and what is written on it each on its own, which the web reads", async () => {
    const before = await db.admin.home.fetch.first();
    const metadata = {
      title: "Welcome – Butte Bible Fellowship",
      description: null,
      hero_heading: "Come and **see**",
      hero_description: "All are welcome.",
      hero_action: "Plan a visit",
      hero_link: "/connect",
    };

    // An update replaces the metadata, and leaves the picture and the body.
    const updated = await db.admin.home.update.first(metadata);
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.home.fetch.first()).toMatchObject({
      ...metadata,
      hero_image: null,
      body: before!.body,
    });

    // The picture is written on its own, and leaves the rest.
    const pictured = await db.admin.home.image.first({
      image: "https://cdn.example.com/home/1.jpg",
    });
    expect(pictured?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.home.fetch.first()).toEqual({
      ...metadata,
      hero_image: "https://cdn.example.com/home/1.jpg",
      body: before!.body,
    });
    await db.admin.home.image({ image: null });

    // The body is written on its own, and leaves the metadata.
    const written = await db.admin.home.body.first({ body: article });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.home.fetch.first()).toEqual({
      ...metadata,
      hero_image: null,
      body: article,
    });
    await db.admin.home.body({ body: null });
    expect(await db.web.home.fetch.first()).toMatchObject({ body: null });

    // Put back, for the tests after this one.
    const { updated_at: _, body, hero_image: __, ...kept } = before!;
    await db.admin.home.update(kept);
    await db.admin.home.body({ body });
    expect(await db.web.home.fetch.first()).toEqual({
      ...kept,
      hero_image: null,
      body,
    });
  });

  it("is one row, and no more", async () => {
    await expect(
      db.build
        .insertInto("home")
        .values({
          title: "Another home",
          hero_heading: HEADING,
          hero_description: "c",
          hero_action: "d",
          hero_link: "/",
        })
        .execute(),
    ).rejects.toThrow(/home_pkey/);
    await expect(
      db.build.updateTable("home").set({ id: false }).execute(),
    ).rejects.toThrow(/home_id_check/);
  });

  it("refuses a hero left without its heading", async () => {
    const {
      updated_at: _,
      body: __,
      hero_image: ___,
      ...kept
    } = (await db.admin.home.fetch.first())!;
    await expect(
      db.admin.home.update({ ...kept, hero_heading: null as never }),
    ).rejects.toThrow(/hero_heading/);
  });
});

describe("admin.about", () => {
  it("writes its metadata and what is written on it each on its own, which the web reads", async () => {
    const before = await db.admin.about.fetch.first();
    expect(before?.updated_at).toBeInstanceOf(Date);
    const metadata = { title: "Who We Are", description: null };

    const updated = await db.admin.about.update.first(metadata);
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.about.fetch.first()).toEqual({
      ...metadata,
      body: before!.body,
    });

    const written = await db.admin.about.body.first({ body: null });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.about.fetch.first()).toEqual({
      ...metadata,
      body: null,
    });

    // Put back, for the tests after this one.
    const { updated_at: _, body, ...kept } = before!;
    await db.admin.about.update(kept);
    await db.admin.about.body({ body });
    expect(await db.web.about.fetch.first()).toEqual({ ...kept, body });
  });

  it("is one row, and no more", async () => {
    await expect(
      db.build.insertInto("about").values({ title: "Another" }).execute(),
    ).rejects.toThrow(/about_pkey/);
  });
});

describe("admin.appearance", () => {
  it("writes the seeds, the patch they come to and the modifiers together, and the web reads the patch and the modifiers alone", async () => {
    const before = await db.admin.appearance.fetch.first();
    expect(before).toEqual({
      seeds: {},
      input: {},
      updated_at: expect.any(Date),
    });
    const seeds = { primary: "#7c3aed" };
    const patch = {
      tokens: {
        "primary-500": {
          colorSpace: "srgb",
          components: [0.5451, 0.36078, 0.96471],
          hex: "#8b5cf6",
        },
      },
    };
    const input = { color: "dark" };

    const updated = await db.admin.appearance.update.first({
      seeds,
      patch,
      input,
    });
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.admin.appearance.fetch.first()).toMatchObject({
      seeds,
      input,
    });
    expect(await db.web.appearance.fetch.first()).toEqual({ patch, input });

    // Put back, for the tests after this one.
    await db.admin.appearance.update({ seeds: {}, patch: {}, input: {} });
    expect(await db.web.appearance.fetch.first()).toEqual({
      patch: {},
      input: {},
    });
  });

  it("is one row, and no more", async () => {
    await expect(
      db.build.insertInto("appearance").defaultValues().execute(),
    ).rejects.toThrow(/appearance_pkey/);
  });
});

describe("admin.connect", () => {
  it("writes its metadata and what is written on it each on its own, which the web reads", async () => {
    const before = await db.admin.connect.fetch.first();
    expect(before?.updated_at).toBeInstanceOf(Date);
    const metadata = {
      title: "Find Us",
      description: null,
      address: "1 Main Street, Chico",
      phone: null,
      fax: null,
      email: null,
      hours: null,
    };

    const updated = await db.admin.connect.update.first(metadata);
    expect(updated?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.connect.fetch.first()).toEqual({
      ...metadata,
      body: null,
    });

    const body = { type: "root", children: [] };
    const written = await db.admin.connect.body.first({ body });
    expect(written?.updated_at).toBeInstanceOf(Date);
    expect(await db.web.connect.fetch.first()).toEqual({ ...metadata, body });

    // Put back, for the tests after this one.
    const { updated_at: _, body: none, ...kept } = before!;
    await db.admin.connect.update(kept);
    await db.admin.connect.body({ body: none });
    expect(await db.web.connect.fetch.first()).toEqual({ ...kept, body: none });
  });

  it("needs an address, which its map is drawn from", async () => {
    const {
      updated_at: _,
      body: __,
      ...kept
    } = (await db.admin.connect.fetch.first())!;
    await expect(
      // @ts-expect-error: the address is required.
      db.admin.connect.update({ ...kept, address: null }),
    ).rejects.toThrow(/address/);
  });

  it("is one row, and no more", async () => {
    await expect(
      db.build
        .insertInto("connect")
        .values({ title: "Another", address: "Elsewhere" })
        .execute(),
    ).rejects.toThrow(/connect_pkey/);
  });
});

describe("the pages migration", () => {
  /*
   * A database the content seed had written the two pages to, as it did
   * before the pages had tables of their own, and the admin had changed.
   */
  const index = migrations.findIndex(({ name }) => name === "pages");
  const seeded = {
    version: "0011a",
    name: "seeded",
    checksum: "seeded",
    sql: `
      INSERT INTO content (slug, title, description, body) VALUES
        ('index', 'Home, as the admin left it', NULL,
          '{"type":"root","children":[]}'::jsonb),
        ('about-us', 'About Us – Butte Bible Fellowship', 'For search.',
          '{"type":"root","children":[{"type":"text","value":"Ours."}]}'::jsonb),
        ('membership', 'Membership', NULL, NULL);
    `,
  };

  it("moves the two pages out of the content, each as the admin left it, and keeps the rest", async () => {
    await using moved = await makeTestBezoar(contract, {
      queries,
      migrations: [
        ...migrations.slice(0, index),
        seeded,
        ...migrations.slice(index),
      ],
      database: { extensions: { fuzzystrmatch, pg_trgm } },
    });
    expect(await moved.web.home.fetch.first()).toMatchObject({
      title: "Home, as the admin left it",
      description: null,
      hero_heading: HEADING,
      body: { type: "root", children: [] },
    });
    // About Us keeps what was written on it: its title and description
    // are its header's now, not what search engines showed.
    expect(await moved.web.about.fetch.first()).toEqual({
      title: "About Us",
      description:
        "A clean canvas: passing the baton to a new generation of Christ followers.",
      body: { type: "root", children: [{ type: "text", value: "Ours." }] },
    });
    expect((await moved.web.content.list()).map((row) => row.slug)).toEqual([
      "membership",
    ]);
  });
});

describe("a folder's totals", () => {
  const body = (value: string) => ({
    type: "root",
    children: [{ type: "text", value }],
  });

  /* What a folder's row keeps of all that is under it. */
  const kept = async (id: number) => {
    const row = (await db.admin.folders.fetch.first({ id }))!;
    return { size: row.size, count: row.count, at: row.updated_at.getTime() };
  };

  /* Puts folders' dates back, so that a change after it shows as one. */
  const LONG_AGO = new Date("2026-01-01T00:00:00Z");
  const age = (...ids: number[]) =>
    db.build
      .updateTable("folders")
      .set({ updated_at: LONG_AGO })
      .where("id", "in", ids)
      .execute();

  it("keeps each folder's size, count and date in step with every write under it, however deep", async () => {
    const a = (await db.admin.folders.create.first({ name: "Kept A" }))!.id;
    const b = (await db.admin.folders.create.first({ name: "Kept B" }))!.id;
    const inner = (await db.admin.folders.create.first({
      name: "Inner",
      parent_id: a,
    }))!.id;
    expect(await kept(a)).toMatchObject({ size: 0, count: 1 });
    expect(await kept(b)).toMatchObject({ size: 0, count: 0 });
    await age(a, b, inner);

    // A document written in a folder under it: counted where it is filed,
    // and its bytes in every folder above.
    const page = (await db.admin.content.create.first({
      slug: "kept-page",
      title: "Kept page",
      folder_id: inner,
    }))!.id;
    expect(await kept(inner)).toMatchObject({ size: 0, count: 1 });
    expect(await kept(a)).toMatchObject({ size: 0, count: 1 });
    const written = (await db.admin.content.body.first({
      id: page,
      body: body("Kept in step."),
    }))!;
    expect(written.size).toBeGreaterThan(0);
    expect(await kept(inner)).toEqual({
      size: written.size,
      count: 1,
      at: written.updated_at.getTime(),
    });
    expect(await kept(a)).toEqual({
      size: written.size,
      count: 1,
      at: written.updated_at.getTime(),
    });
    // A folder beside them is as it was.
    expect(await kept(b)).toEqual({
      size: 0,
      count: 0,
      at: LONG_AGO.getTime(),
    });

    // Written again, longer and then shorter: the difference alone.
    const longer = (await db.admin.content.body.first({
      id: page,
      body: body("Kept in step, and at more length."),
    }))!;
    expect((await kept(a)).size).toBe(longer.size);
    const metadata = await db.admin.content.update.first({
      id: page,
      slug: "kept-page",
      title: "Kept page, retitled",
    });
    expect(await kept(a)).toEqual({
      size: longer.size,
      count: 1,
      at: metadata!.updated_at.getTime(),
    });

    // Filed elsewhere, the page keeps its own date, and both folders are
    // changed by it: one gives up what the other takes on.
    await age(a, b, inner);
    await db.admin.content.folder({ id: page, folder_id: b });
    expect(await kept(inner)).toMatchObject({ size: 0, count: 0 });
    expect(await kept(a)).toMatchObject({ size: 0, count: 1 });
    expect(await kept(b)).toMatchObject({ size: longer.size, count: 1 });
    for (const id of [a, b, inner]) {
      expect((await kept(id)).at, String(id)).toBeGreaterThan(
        LONG_AGO.getTime(),
      );
    }
    expect(
      (await db.admin.content.fetch.first({ id: page }))!.updated_at,
    ).toEqual(metadata!.updated_at);

    // To the top, and back under a folder: the top keeps no total.
    await db.admin.content.folder({ id: page });
    expect(await kept(b)).toMatchObject({ size: 0, count: 0 });
    await db.admin.content.folder({ id: page, folder_id: inner });
    expect(await kept(a)).toMatchObject({ size: longer.size, count: 1 });

    // A folder moved takes all it holds with it.
    await db.admin.folders.parent({ id: inner, parent_id: b });
    expect(await kept(a)).toMatchObject({ size: 0, count: 0 });
    expect(await kept(b)).toMatchObject({ size: longer.size, count: 1 });
    expect(await kept(inner)).toMatchObject({ size: longer.size, count: 1 });
    // One refused, into itself, moves nothing.
    await db.admin.folders.parent({ id: b, parent_id: inner });
    expect(await kept(b)).toMatchObject({ size: longer.size, count: 1 });

    // Renamed, a folder changes the one it is inside, and no size.
    const renamed = await db.admin.folders.update.first({
      id: inner,
      name: "Innermost",
    });
    expect(await kept(b)).toEqual({
      size: longer.size,
      count: 1,
      at: renamed!.updated_at.getTime(),
    });

    // The list reads the same rows.
    expect(
      (await db.admin.folders.list({ direction: "desc", sort: "size" }))
        .filter((row) => [a, b].includes(row.id))
        .map((row) => [row.id, row.size, row.count]),
    ).toEqual([
      [b, longer.size, 1],
      [a, 0, 0],
    ]);

    // Removed, a document is no longer in what was above it, which is
    // changed by its going; and so a folder.
    await age(b);
    await db.admin.content.delete({ id: page });
    expect(await kept(inner)).toMatchObject({ size: 0, count: 0 });
    expect(await kept(b)).toMatchObject({ size: 0, count: 1 });
    expect((await kept(b)).at).toBeGreaterThan(LONG_AGO.getTime());
    expect(await db.admin.folders.delete({ id: inner })).toBe(1);
    expect(await kept(b)).toMatchObject({ size: 0, count: 0 });
    expect(await db.admin.folders.delete({ id: a })).toBe(1);
    expect(await db.admin.folders.delete({ id: b })).toBe(1);
  });
});

describe("the documents migration", () => {
  /*
   * A database with pages written before a document had a kind or a size:
   * one with a body, one with none.
   */
  const index = migrations.findIndex(({ name }) => name === "documents");
  const body = '{"type":"root","children":[{"type":"text","value":"Ours."}]}';
  const written = {
    version: "0015a",
    name: "written",
    checksum: "written",
    sql: `
      INSERT INTO content (slug, title, body) VALUES
        ('membership', 'Membership', '${body}'::jsonb),
        ('untouched', 'Untouched', NULL);
      INSERT INTO folders (name, updated_at) VALUES
        ('Outer', '2026-01-01T00:00:00Z'), ('Empty', '2026-01-02T00:00:00Z');
      INSERT INTO folders (name, parent_id, updated_at)
        SELECT 'Inner', id, '2026-01-03T00:00:00Z'
        FROM folders WHERE name = 'Outer';
      INSERT INTO content (slug, title, body, folder_id, updated_at)
        SELECT 'buried', 'Buried', '${body}'::jsonb, id, '2026-02-01T00:00:00Z'
        FROM folders WHERE name = 'Inner';
      INSERT INTO content (slug, title, folder_id, updated_at)
        SELECT 'shallow', 'Shallow', id, '2026-01-15T00:00:00Z'
        FROM folders WHERE name = 'Outer';
    `,
  };

  it("makes every page an article, of the size of what is written on it", async () => {
    await using moved = await makeTestBezoar(contract, {
      queries,
      migrations: [
        ...migrations.slice(0, index),
        written,
        ...migrations.slice(index),
      ],
      database: { extensions: { fuzzystrmatch, pg_trgm } },
    });
    const listed = await moved.admin.content.list({
      direction: "asc",
      tz: "America/Los_Angeles",
    });
    expect(listed.map((row) => [row.slug, row.mime])).toEqual([
      ["membership", "application/vnd.bbf.article+json"],
      ["untouched", "application/vnd.bbf.article+json"],
    ]);
    // The bytes of the body as the database writes it out as text.
    expect(listed[0]!.size).toBeGreaterThanOrEqual(body.length);
    expect(listed[1]!.size).toBe(0);

    // Each folder is given what all that is under it comes to, as it
    // stood: its size, how many it holds itself, and its latest change.
    const size = listed[0]!.size;
    const top = await moved.admin.folders.list({ direction: "asc" });
    expect(
      top.map((row) => [
        row.name,
        row.size,
        row.count,
        row.updated_at.toISOString(),
      ]),
    ).toEqual([
      ["Empty", 0, 0, "2026-01-02T00:00:00.000Z"],
      ["Outer", size, 2, "2026-02-01T00:00:00.000Z"],
    ]);
    const [inner] = await moved.admin.folders.list({
      direction: "asc",
      parent_id: top[1]!.id,
    });
    expect([inner!.size, inner!.count]).toEqual([size, 1]);
  });
});

describe("the content's paths", () => {
  /* The folders a path's names find, the top's first, by how deep each is. */
  const walk = (...path: string[]) =>
    db.admin.folders.walk({ path: JSON.stringify(path) });

  it("walks a path of names from the top, as far down as it holds", async () => {
    const notes = await db.admin.folders.create.first({ name: "Sermon notes" });
    const romans = await db.admin.folders.create.first({
      name: "Romans",
      parent_id: notes!.id,
    });
    // A name is its own among the folders beside it alone: another Romans,
    // at the top, is another folder.
    const other = await db.admin.folders.create.first({ name: "Romans" });

    expect(await walk()).toEqual([]);
    expect(await walk("Sermon notes")).toEqual([{ depth: 1, id: notes!.id }]);
    expect(await walk("Sermon notes", "Romans")).toEqual([
      { depth: 1, id: notes!.id },
      { depth: 2, id: romans!.id },
    ]);
    expect(await walk("Romans")).toEqual([{ depth: 1, id: other!.id }]);

    // The walk stops at the first name no folder there has, and goes no
    // further: a folder under one that is not there is not found.
    expect(await walk("Sermon notes", "Galatians")).toEqual([
      { depth: 1, id: notes!.id },
    ]);
    expect(await walk("Galatians", "Romans")).toEqual([]);
    // A name is matched as it is written, its case with it.
    expect(await walk("sermon notes")).toEqual([]);

    await db.admin.folders.delete({ id: romans!.id });
    await db.admin.folders.delete({ id: other!.id });
    await db.admin.folders.delete({ id: notes!.id });
  });

  it("finds the document a path ends in, in the folder it is filed in", async () => {
    const folder = await db.admin.folders.create.first({ name: "Guides" });
    const filed = await db.admin.content.create.first({
      slug: "getting-started",
      title: "Getting started",
      folder_id: folder!.id,
    });
    const top = await db.admin.content.create.first({
      slug: "at-the-top",
      title: "At the top",
    });

    expect(
      await db.admin.content.locate.first({
        folder_id: folder!.id,
        slug: "getting-started",
      }),
    ).toEqual({ id: filed!.id });
    expect(await db.admin.content.locate.first({ slug: "at-the-top" })).toEqual(
      { id: top!.id },
    );
    // A document is found where it is filed, and nowhere else.
    expect(
      await db.admin.content.locate.first({ slug: "getting-started" }),
    ).toBeNull();
    expect(
      await db.admin.content.locate.first({
        folder_id: folder!.id,
        slug: "at-the-top",
      }),
    ).toBeNull();

    await db.admin.content.delete({ id: filed!.id });
    await db.admin.content.delete({ id: top!.id });
    await db.admin.folders.delete({ id: folder!.id });
  });

  it("refuses a folder's name that is no step of a path", async () => {
    for (const name of ["a/b", "/", "a\\b", "why?", "#1", "50%", ".", ".."]) {
      expect(await refusal(db.admin.folders.create({ name })), name).toMatch(
        /folders_name_step/,
      );
    }
    // A dot is no more than a letter anywhere else in a name, and what an
    // address reads as nothing else is free.
    const dotted = await db.admin.folders.create.first({
      name: "v1.2 ... one, two & more!",
    });
    expect(dotted).not.toBeNull();
    expect(
      await refusal(db.admin.folders.update({ id: dotted!.id, name: "a/b" })),
    ).toMatch(/folders_name_step/);
    await db.admin.folders.delete({ id: dotted!.id });
  });

  it("refuses a folder and a document beside one another the same name, whichever comes second", async () => {
    const folder = await db.admin.folders.create.first({ name: "guides" });
    const inside = await db.admin.folders.create.first({
      name: "inside",
      parent_id: folder!.id,
    });
    const document = await db.admin.content.create.first({
      slug: "handbook",
      title: "Handbook",
    });

    // A document written, or renamed, to where a folder answers.
    expect(
      await constraint(
        db.admin.content.create({ slug: "guides", title: "Guides" }),
      ),
    ).toBe("content_path_taken");
    expect(
      await constraint(
        db.admin.content.update({
          id: document!.id,
          slug: "guides",
          title: "Handbook",
        }),
      ),
    ).toBe("content_path_taken");

    // A folder made, or renamed, to where a document answers.
    expect(
      await constraint(db.admin.folders.create({ name: "handbook" })),
    ).toBe("folders_path_taken");
    expect(
      await constraint(
        db.admin.folders.update({ id: inside!.id, name: "handbook" }),
      ),
    ).not.toBe("folders_path_taken");
    expect(
      await constraint(
        db.admin.folders.update({ id: folder!.id, name: "handbook" }),
      ),
    ).toBe("folders_path_taken");

    // Under another folder the name is free: it is another path.
    await db.admin.folders.update({ id: inside!.id, name: "inside" });
    const nested = await db.admin.content.create.first({
      slug: "guides",
      title: "Guides",
      folder_id: folder!.id,
    });
    expect(nested).not.toBeNull();

    // And neither is moved to where the other answers: the document out to
    // the top, beside the folder of its name, nor a folder of the
    // document's name in beside it.
    expect(await constraint(db.admin.content.folder({ id: nested!.id }))).toBe(
      "content_path_taken",
    );
    const twin = await db.admin.folders.create.first({
      name: "handbook",
      parent_id: folder!.id,
    });
    expect(await constraint(db.admin.folders.parent({ id: twin!.id }))).toBe(
      "folders_path_taken",
    );

    // What is written on a document, which names nothing, is written still.
    expect(
      await db.admin.content.body.first({ id: nested!.id, body: null }),
    ).not.toBeNull();

    await db.admin.content.delete({ id: nested!.id });
    await db.admin.content.delete({ id: document!.id });
    await db.admin.folders.delete({ id: twin!.id });
    await db.admin.folders.delete({ id: inside!.id });
    await db.admin.folders.delete({ id: folder!.id });
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

    // The days a calendar shows: a one-off whose date is among them, and
    // each recurring event that has begun by the last of them.
    expect(
      await slugs({ held_from: "2026-10-01", held_to: "2026-10-31" }),
    ).toEqual([...WEEKLY, "harvest-supper"]);
    expect(
      await slugs({ held_from: "2026-11-01", held_to: "2026-11-30" }),
    ).toEqual(WEEKLY);
    expect(
      await slugs({ held_from: "2025-12-01", held_to: "2025-12-31" }),
    ).toEqual([]);
    expect(
      await slugs({
        held_from: "2026-10-01",
        held_to: "2026-10-31",
        recurring_is: false,
      }),
    ).toEqual(["harvest-supper"]);

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

    // A recurring event is held from its date on: a calendar's days before
    // it leave it out.
    const held = async (held_from: string, held_to: string) =>
      (await db.admin.events.list({ ...all, held_from, held_to })).map(
        (event) => event.slug,
      );
    expect(await held("2026-03-01", "2026-04-04")).toEqual(
      ordered.filter((slug) => slug !== "choir"),
    );
    expect(await held("2026-05-31", "2026-07-04")).toEqual(ordered);

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

describe("admin.views", () => {
  const sub = "117000000000000000001";
  const other = "117000000000000000002";
  const id = "0b1f4c4e-6f0a-4d0e-9a57-3f0c1c2d4e5f";
  const payload = {
    sorting: [{ id: "name", desc: true }],
    columnVisibility: { email: false },
    pageSize: 50,
    clauses: [{ kind: "filter", key: "role", op: "is", value: "elder" }],
  };
  const users: number[] = [];

  beforeAll(async () => {
    for (const [email, bound] of [
      ["views@example.com", sub],
      ["other@example.com", other],
    ] as const) {
      const created = await db.admin.users.create.first({
        email,
        role: "editor",
      });
      await db.admin.users.claim.first({ sub: bound, email });
      users.push(created!.id);
    }
  });

  const names = async (of: string, surface = "staff") =>
    (await db.admin.views.list({ sub: of, surface })).map((row) => row.name);

  it("saves a view under the id it comes with, and lists a user's own of one list", async () => {
    expect(await names(sub)).toEqual([]);

    const saved = await db.admin.views.save.first({
      id,
      sub,
      surface: "staff",
      name: "Elders",
      payload,
    });
    expect(saved).toMatchObject({ id, surface: "staff", name: "Elders" });
    expect(saved?.payload).toEqual(payload);
    expect(saved?.created_at).toBeInstanceOf(Date);

    expect(await names(sub)).toEqual(["Elders"]);
    expect(await names(sub, "content")).toEqual([]);
    expect(await names(other)).toEqual([]);
  });

  it("saves over a view of the user's own: its name and its payload, and when it was changed", async () => {
    const saved = await db.admin.views.save.first({
      id,
      sub,
      surface: "staff",
      name: "The elders",
      payload: { ...payload, pageSize: 10 },
    });
    expect(saved).toMatchObject({ id, name: "The elders" });
    expect(saved?.payload).toMatchObject({ pageSize: 10 });
    expect(saved!.updated_at.getTime()).toBeGreaterThanOrEqual(
      saved!.created_at.getTime(),
    );
    expect(await names(sub)).toEqual(["The elders"]);
  });

  it("leaves a view to its user and its list, and saves nothing for no one", async () => {
    const view = { id, name: "Taken", payload: {} };
    expect(
      await db.admin.views.save.first({
        ...view,
        sub: other,
        surface: "staff",
      }),
    ).toBeNull();
    expect(
      await db.admin.views.save.first({ ...view, sub, surface: "content" }),
    ).toBeNull();
    expect(
      await db.admin.views.save.first({
        ...view,
        id: "5d2a8a7e-2b1c-4c3d-8e9f-0a1b2c3d4e5f",
        sub: "nobody",
        surface: "staff",
      }),
    ).toBeNull();
    expect(await names(sub)).toEqual(["The elders"]);

    expect(
      await db.admin.views.delete({ id, sub: other, surface: "staff" }),
    ).toBe(0);
    expect(await db.admin.views.delete({ id, sub, surface: "content" })).toBe(
      0,
    );
    expect(await names(sub)).toEqual(["The elders"]);
  });

  it("refuses an id that is not one, and a name or a list left empty", async () => {
    const view = { id, sub, surface: "staff", name: "Elders", payload };
    await expect(
      db.admin.views.save({ ...view, id: "elders" }),
    ).rejects.toThrow();
    const fresh = { ...view, id: "9c3b7a6d-1e2f-4a5b-8c7d-6e5f4a3b2c1d" };
    expect(await refusal(db.admin.views.save({ ...fresh, name: "" }))).toMatch(
      /views_name_check/,
    );
    expect(
      await refusal(db.admin.views.save({ ...fresh, surface: "" })),
    ).toMatch(/views_surface_check/);
  });

  it("removes a view, and every view of a user removed", async () => {
    expect(await db.admin.views.delete({ id, sub, surface: "staff" })).toBe(1);
    expect(await names(sub)).toEqual([]);

    await db.admin.views.save({
      id,
      sub: other,
      surface: "staff",
      name: "Mine",
      payload,
    });
    expect(await names(other)).toEqual(["Mine"]);
    for (const user of users) {
      expect(await db.admin.users.delete({ id: user })).toBe(1);
    }
    expect(
      await db.build.selectFrom("views").selectAll().execute(),
    ).toHaveLength(0);
  });
});

describe("admin.changes", () => {
  const mark = async (surface: string) =>
    (await db.admin.changes.fetch.first({ surface }))?.version;

  it("counts every write to the people, a removal among them, and leaves the mark where nothing is written", async () => {
    const before = await mark("people");
    expect(before).toMatch(/^\d+$/);
    await db.admin.people.fetch.first({ id: 1 });
    expect(await mark("people")).toBe(before);

    const made = await db.admin.people.create.first({
      first_name: "Counted",
      last_name: "Person",
      role: "member",
      email: "counted@example.com",
    });
    const added = await mark("people");
    expect(BigInt(added!)).toBe(BigInt(before!) + 1n);

    await db.admin.people.photo.first({ id: made!.id, photo: null });
    const changed = await mark("people");
    expect(BigInt(changed!)).toBe(BigInt(added!) + 1n);

    expect(await db.admin.people.delete({ id: made!.id })).toBe(1);
    expect(BigInt((await mark("people"))!)).toBe(BigInt(changed!) + 1n);
  });

  it("counts the content's documents and its folders as one list, apart from the people", async () => {
    const people = await mark("people");
    const before = BigInt((await mark("content"))!);
    const folder = await db.admin.folders.create.first({ name: "Counted" });
    const made = BigInt((await mark("content"))!);
    expect(made).toBeGreaterThan(before);
    const page = await db.admin.content.create.first({
      slug: "counted",
      title: "Counted",
      folder_id: folder!.id,
    });
    const filed = BigInt((await mark("content"))!);
    expect(filed).toBeGreaterThan(made);
    await db.admin.content.delete({ id: page!.id });
    const removed = BigInt((await mark("content"))!);
    expect(removed).toBeGreaterThan(filed);
    await db.admin.folders.delete({ id: folder!.id });
    expect(BigInt((await mark("content"))!)).toBeGreaterThan(removed);
    expect(await mark("people")).toBe(people);
  });

  it("keeps no count for a list that is none of its own", async () => {
    expect(await mark("events")).toBeUndefined();
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
          !name.startsWith("admin.folders.") &&
          !name.startsWith("admin.views.") &&
          !name.startsWith("admin.changes.") &&
          // The people's private columns are not web's to read.
          !name.startsWith("admin.people.") &&
          /\.(fetch|list|locate|upcoming|weekly)$/.test(name),
      ),
    );
  });

  it("reads the site as web", async () => {
    expect(await web.web.staff.list()).toHaveLength(3);
    expect(await web.web.events.weekly()).toHaveLength(8);
    expect(await web.web.content.list()).toHaveLength(0);
    expect(await web.web.home.fetch()).toHaveLength(1);
    expect(await web.web.about.fetch()).toHaveLength(1);
    expect(await web.web.connect.fetch()).toHaveLength(1);
    expect(await web.web.appearance.fetch()).toHaveLength(1);
  });

  it("keeps a folder's totals as admin writes under it", async () => {
    const folder = await admin.admin.folders.create.first({ name: "Granted" });
    const page = await admin.admin.content.create.first({
      slug: "granted",
      title: "Granted",
      folder_id: folder!.id,
    });
    const written = await admin.admin.content.body.first({
      id: page!.id,
      body: { type: "root", children: [{ type: "text", value: "Kept." }] },
    });
    expect(
      await admin.admin.folders.fetch.first({ id: folder!.id }),
    ).toMatchObject({ size: written!.size, count: 1 });
    await admin.admin.content.delete({ id: page!.id });
    expect(await admin.admin.folders.delete({ id: folder!.id })).toBe(1);
  });

  it("counts what admin writes, and keeps the count from web", async () => {
    const mark = async () =>
      (await admin.admin.changes.fetch.first({ surface: "people" }))!.version;
    const before = await mark();
    const made = await admin.admin.people.create.first({
      first_name: "Granted",
      last_name: "Person",
      role: "member",
      email: "granted@example.com",
    });
    await admin.admin.people.delete({ id: made!.id });
    expect(BigInt(await mark())).toBe(BigInt(before) + 2n);
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.changes.fetch", { surface: "people" }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
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
      web.build.deleteFrom("content").where("slug", "=", "welcome").execute(),
    ).rejects.toThrow(/permission denied for table content/);
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.home.body", { body: null }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    await expect(
      web.build.updateTable("about").set({ title: "Gone" }).execute(),
    ).rejects.toThrow(/permission denied for table about/);
    expect(await web.web.about.fetch.first()).toMatchObject({
      title: "About Us",
    });
  });

  it("lets admin change a page with a table of its own, and neither add nor remove it", async () => {
    expect(
      await admin.admin.about.update.first({ title: "Who We Are" }),
    ).toMatchObject({ updated_at: expect.any(Date) });
    expect(await admin.admin.about.fetch.first()).toMatchObject({
      title: "Who We Are",
      description: null,
    });
    await expect(admin.build.deleteFrom("about").execute()).rejects.toThrow(
      /permission denied for table about/,
    );
    await expect(admin.build.deleteFrom("home").execute()).rejects.toThrow(
      /permission denied for table home/,
    );
    await expect(admin.build.deleteFrom("connect").execute()).rejects.toThrow(
      /permission denied for table connect/,
    );
  });

  it("lets admin change how the site looks, and web only read it", async () => {
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.appearance.update", { seeds: {}, patch: {}, input: {} }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    await expect(
      web.build.updateTable("appearance").set({ input: "{}" }).execute(),
    ).rejects.toThrow(/permission denied for table appearance/);
    expect(
      await admin.admin.appearance.update.first({
        seeds: {},
        patch: {},
        input: {},
      }),
    ).toMatchObject({ updated_at: expect.any(Date) });
    await expect(
      admin.build.deleteFrom("appearance").execute(),
    ).rejects.toThrow(/permission denied for table appearance/);
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

  it("keeps a person's private columns, and the members, from web", async () => {
    await expect(
      // @ts-expect-error: not a query of web.
      web.query("admin.people.fetch", { id: 1 }),
    ).rejects.toBeInstanceOf(ForbiddenQueryError);
    for (const column of ["address", "birthday"] as const) {
      await expect(
        web.build.selectFrom("people").select(column).execute(),
      ).rejects.toThrow(/permission denied for table people/);
    }
    await expect(
      web.build.selectFrom("people").selectAll().execute(),
    ).rejects.toThrow(/permission denied for table people/);
    expect(
      await web.build.selectFrom("people").select("name").execute(),
    ).toHaveLength(3);
  });

  it("writes as admin, with ids the database fills", async () => {
    const created = await admin.admin.people.create.first({
      first_name: "Office",
      last_name: "Name",
      role: "staff",
    });
    expect(created?.id).toBeGreaterThan(0);
    expect(
      await admin.admin.people.fetch.first({ id: created!.id }),
    ).toMatchObject({ name: "Office Name" });
    expect(await admin.admin.people.delete({ id: created!.id })).toBe(1);
  });
});
