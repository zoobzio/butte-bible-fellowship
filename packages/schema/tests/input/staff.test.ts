import { describe, expect, it } from "vitest";

import { staffBody, staffId } from "../../src/input/staff";

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
