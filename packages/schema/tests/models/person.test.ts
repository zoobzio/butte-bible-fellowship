import { describe, expect, it } from "vitest";

import {
  PERSON_ROLES,
  personListing,
  staffMember,
  staffMembers,
  personRecord,
  personRole,
} from "../../src/models/person";

const MEMBER = { id: 1, name: "Jane Doe", role: "elder" };

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

const RECORD = {
  ...MEMBER,
  firstName: "Jane",
  lastName: "Doe",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

describe("personRole", () => {
  it("is one of pastor, elder, staff and member, in the order they are listed", () => {
    expect(PERSON_ROLES).toEqual(["pastor", "elder", "staff", "member"]);
    expect(personRole.parse("member")).toBe("member");
    expect(personRole.parse("elder")).toBe("elder");
    expect(personRole.safeParse("deacon").success).toBe(false);
    expect(personRole.safeParse("Elder").success).toBe(false);
  });
});

describe("staffMember", () => {
  it("needs an id, a name and a role", () => {
    expect(staffMember.parse(MEMBER)).toEqual(MEMBER);
    for (const key of ["id", "name", "role"]) {
      const { [key]: _gone, ...without } = MEMBER as Record<string, unknown>;
      expect(staffMember.safeParse(without).success, key).toBe(false);
    }
  });

  it("accepts all a member can say", () => {
    const value = {
      ...MEMBER,
      role: "pastor",
      summary: "Has served since 2010.",
      bio: BIO,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
    };
    expect(staffMember.parse(value)).toEqual(value);
  });

  it("takes a bio as a tree, never as a string", () => {
    expect(
      staffMember.safeParse({ ...MEMBER, bio: "## Jane\n\nHas served." })
        .success,
    ).toBe(false);
  });

  it("rejects an email, a photo or a role that is not one", () => {
    expect(staffMember.safeParse({ ...MEMBER, email: "jane" }).success).toBe(
      false,
    );
    expect(
      staffMember.safeParse({ ...MEMBER, photo: "/staff/jane-doe.jpg" })
        .success,
    ).toBe(false);
    expect(staffMember.safeParse({ ...MEMBER, role: "Elder" }).success).toBe(
      false,
    );
  });

  it("carries no status: whoever is on the staff is on the site", () => {
    expect(staffMember.parse({ ...MEMBER, status: "draft" })).toEqual(MEMBER);
  });
});

describe("staffMember title", () => {
  it("carries what they are called for what they do, where it is written", () => {
    const value = { ...MEMBER, title: "Worship Director" };
    expect(staffMember.parse(value)).toEqual(value);
  });
});

describe("staffMembers", () => {
  it("is a list of members", () => {
    expect(staffMembers.parse([MEMBER])).toEqual([MEMBER]);
    expect(staffMembers.safeParse([{ name: "Jane Doe" }]).success).toBe(false);
  });
});

describe("personRecord", () => {
  it("needs their name, in full and in its parts, their role and their timestamps", () => {
    expect(personRecord.parse(RECORD)).toEqual(RECORD);
    for (const key of [
      "id",
      "firstName",
      "lastName",
      "name",
      "role",
      "createdAt",
      "updatedAt",
    ]) {
      const { [key]: _gone, ...without } = RECORD as Record<string, unknown>;
      expect(personRecord.safeParse(without).success, key).toBe(false);
    }
  });

  it("accepts all a person can say, the bio as the tree the editor wrote", () => {
    const value = {
      ...RECORD,
      title: "Worship Director",
      summary: "Has served since 2010.",
      bio: BIO,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    };
    expect(personRecord.parse(value)).toEqual(value);
    expect(
      personRecord.safeParse({ ...RECORD, birthday: "April 12" }).success,
    ).toBe(false);
    expect(
      personRecord.safeParse({ ...RECORD, bio: "## Jane\n\nHas served." })
        .success,
    ).toBe(false);
  });

  it("names a person by a whole number from one", () => {
    expect(personRecord.safeParse({ ...RECORD, id: 0 }).success).toBe(false);
    expect(personRecord.safeParse({ ...RECORD, id: "1" }).success).toBe(false);
  });

  it("says when the row was written and changed as a moment, in UTC", () => {
    expect(
      personRecord.safeParse({ ...RECORD, createdAt: "2026-10-17" }).success,
    ).toBe(false);
  });

  it("rejects a role that is not one", () => {
    expect(personRecord.safeParse({ ...RECORD, role: "deacon" }).success).toBe(
      false,
    );
  });

  it("carries no status", () => {
    expect(personRecord.parse({ ...RECORD, status: "draft" })).toEqual(RECORD);
  });
});

describe("personListing", () => {
  it("is a page of records and how many there are in all", () => {
    const page = { items: [RECORD], total: 1 };
    expect(personListing.parse(page)).toEqual(page);
    expect(personListing.safeParse({ items: [MEMBER], total: 1 }).success).toBe(
      false,
    );
  });

  it("carries the mark the people were read at, to be asked with next", () => {
    const page = { items: [RECORD], total: 1, since: "7" };
    expect(personListing.parse(page)).toEqual(page);
  });
});
