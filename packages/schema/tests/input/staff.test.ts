import { describe, expect, it } from "vitest";

import {
  staffBody,
  staffForm,
  staffId,
  staffQuery,
  STAFF_SORT_KEYS,
} from "../../src/input/staff";

const MEMBER = { name: "Jane Doe", role: "elder" };

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Has served since 2010." }],
    },
  ],
};

describe("staffId", () => {
  it("names a member by their row's number, as the address writes it", () => {
    expect(staffId.parse({ id: "12" })).toEqual({ id: 12 });
    expect(staffId.safeParse({ id: "0" }).success).toBe(false);
    expect(staffId.safeParse({ id: "1.5" }).success).toBe(false);
    expect(staffId.safeParse({ id: "jane-doe" }).success).toBe(false);
  });
});

describe("staffQuery", () => {
  it("is the listing query, with a role and a status held or not to narrow it", () => {
    expect(staffQuery.parse({})).toEqual({ page: 1, size: 25 });
    expect(
      staffQuery.parse({
        page: "2",
        q: "jane",
        roleIs: "elder",
        statusNot: "archived",
      }),
    ).toEqual({
      page: 2,
      size: 25,
      q: "jane",
      roleIs: "elder",
      statusNot: "archived",
    });
    expect(
      staffQuery.parse({ roleNot: "pastor", statusIs: "draft" }),
    ).toMatchObject({ roleNot: "pastor", statusIs: "draft" });
  });

  it("takes only a role and a status the staff are written in", () => {
    expect(staffQuery.safeParse({ roleIs: "deacon" }).success).toBe(false);
    expect(staffQuery.safeParse({ roleNot: "deacon" }).success).toBe(false);
    expect(staffQuery.safeParse({ statusIs: "live" }).success).toBe(false);
    expect(staffQuery.safeParse({ statusNot: "live" }).success).toBe(false);
    expect(staffQuery.safeParse({ role: "elder" }).success).toBe(true);
    expect(staffQuery.parse({ role: "elder" })).toEqual({ page: 1, size: 25 });
  });

  it("takes whether each optional column is present or missing", () => {
    expect(
      staffQuery.parse({
        email: "present",
        phone: "missing",
        summary: "present",
        photo: "missing",
      }),
    ).toMatchObject({
      email: "present",
      phone: "missing",
      summary: "present",
      photo: "missing",
    });
    expect(staffQuery.safeParse({ photo: "yes" }).success).toBe(false);
    expect(staffQuery.safeParse({ email: "" }).success).toBe(false);
  });

  it("sorts by a column of the record, either way", () => {
    expect(STAFF_SORT_KEYS).toEqual([
      "name",
      "role",
      "status",
      "email",
      "phone",
      "createdAt",
      "updatedAt",
    ]);
    expect(staffQuery.parse({ sort: "email", direction: "desc" })).toEqual({
      page: 1,
      size: 25,
      sort: "email",
      direction: "desc",
    });
    expect(staffQuery.safeParse({ sort: "bio" }).success).toBe(false);
    expect(staffQuery.safeParse({ sort: "id" }).success).toBe(false);
  });

  it("takes a day each member was changed or added before, after or on, as YYYY-MM-DD", () => {
    expect(
      staffQuery.parse({
        updatedAtBefore: "2026-10-17",
        updatedAtAfter: "2026-10-01",
        updatedAtOn: "2026-10-10",
        createdAtBefore: "2026-09-17",
        createdAtAfter: "2026-09-01",
        createdAtOn: "2026-09-10",
      }),
    ).toMatchObject({
      updatedAtBefore: "2026-10-17",
      createdAtOn: "2026-09-10",
    });
    expect(staffQuery.safeParse({ updatedAtOn: "yesterday" }).success).toBe(
      false,
    );
    expect(staffQuery.safeParse({ createdAtAfter: "10/01/2026" }).success).toBe(
      false,
    );
  });
});

describe("staffBody", () => {
  it("writes a member as a draft when not told otherwise", () => {
    expect(staffBody.parse(MEMBER)).toEqual({ ...MEMBER, status: "draft" });
  });

  it("accepts all a member can say", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      bio: BIO,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      status: "published",
    };
    expect(staffBody.parse(value)).toEqual(value);
  });

  it("needs a name and a role", () => {
    expect(staffBody.safeParse({ role: "elder" }).success).toBe(false);
    expect(staffBody.safeParse({ name: "Jane Doe" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, name: "" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, role: "" }).success).toBe(false);
  });

  it("rejects a status or a role that is not one", () => {
    expect(staffBody.safeParse({ ...MEMBER, status: "hidden" }).success).toBe(
      false,
    );
    expect(staffBody.safeParse({ ...MEMBER, role: "Elder" }).success).toBe(
      false,
    );
  });

  it("takes a bio as a tree, never as a string", () => {
    expect(
      staffBody.safeParse({ ...MEMBER, bio: "## Jane\n\nHas served." }).success,
    ).toBe(false);
  });
});

describe("staffForm", () => {
  it("is the body, with the bio as the HTML the editor holds", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      bio: "<p>Has served since 2010.</p>",
      email: "jane@example.com",
      status: "published",
    };
    expect(staffForm.parse(value)).toEqual(value);
    expect(staffForm.safeParse({ ...MEMBER, bio: BIO }).success).toBe(false);
  });

  it("writes a member as a draft when not told otherwise", () => {
    expect(staffForm.parse(MEMBER)).toEqual({ ...MEMBER, status: "draft" });
  });

  it("trims the name, and needs one left", () => {
    expect(staffForm.parse({ ...MEMBER, name: " Jane Doe " }).name).toBe(
      "Jane Doe",
    );
    expect(staffForm.safeParse({ ...MEMBER, name: "   " }).success).toBe(false);
  });

  it("checks a field on its own, as a form does as it is left", () => {
    expect(staffForm.shape.email.safeParse("jane").success).toBe(false);
    expect(staffForm.shape.email.safeParse(undefined).success).toBe(true);
    expect(staffForm.shape.role.safeParse(undefined).success).toBe(false);
  });
});
