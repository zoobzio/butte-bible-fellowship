import { describe, expect, it } from "vitest";

import { staffBody, staffId, staffPath } from "../../src/input/staff";

const MEMBER = { slug: "jane-doe", name: "Jane Doe", role: "Elder" };

describe("staffPath", () => {
  it("names a member by their slug", () => {
    expect(staffPath.parse({ slug: "jane-doe" })).toEqual({ slug: "jane-doe" });
    expect(staffPath.safeParse({ slug: "Jane Doe" }).success).toBe(false);
  });
});

describe("staffId", () => {
  it("names a member by their row's number, as the address writes it", () => {
    expect(staffId.parse({ id: "12" })).toEqual({ id: 12 });
    expect(staffId.safeParse({ id: "0" }).success).toBe(false);
    expect(staffId.safeParse({ id: "1.5" }).success).toBe(false);
    expect(staffId.safeParse({ id: "jane-doe" }).success).toBe(false);
  });
});

describe("staffBody", () => {
  it("writes a member as a draft, last in the list, when not told otherwise", () => {
    expect(staffBody.parse(MEMBER)).toEqual({
      ...MEMBER,
      position: 0,
      status: "draft",
    });
  });

  it("accepts all a member can say", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      bio: "## Jane\n\nHas served since 2010.",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      position: 2,
      status: "published",
    };
    expect(staffBody.parse(value)).toEqual(value);
  });

  it("needs a slug, a name and a role", () => {
    expect(
      staffBody.safeParse({ name: "Jane Doe", role: "Elder" }).success,
    ).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, name: "" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, role: "" }).success).toBe(false);
  });

  it("rejects a status that is not one", () => {
    expect(staffBody.safeParse({ ...MEMBER, status: "hidden" }).success).toBe(
      false,
    );
  });

  it("rejects a position that is not a whole number from zero", () => {
    expect(staffBody.safeParse({ ...MEMBER, position: -1 }).success).toBe(
      false,
    );
    expect(staffBody.safeParse({ ...MEMBER, position: 1.5 }).success).toBe(
      false,
    );
  });
});
