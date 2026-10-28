import { describe, expect, it } from "vitest";

import {
  CONTENT_STATUSES,
  STAFF_ROLES,
  contentStatus,
  staffListing,
  staffMember,
  staffMembers,
  staffRecord,
  staffRole,
} from "../../src/models/staff";

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
  status: "draft",
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-17T18:00:00.000Z",
};

describe("contentStatus", () => {
  it("is one of draft, published and archived", () => {
    expect(CONTENT_STATUSES).toEqual(["draft", "published", "archived"]);
    expect(contentStatus.parse("published")).toBe("published");
    expect(contentStatus.safeParse("hidden").success).toBe(false);
  });
});

describe("staffRole", () => {
  it("is one of pastor, elder and staff, in the order the site lists them", () => {
    expect(STAFF_ROLES).toEqual(["pastor", "elder", "staff"]);
    expect(staffRole.parse("elder")).toBe("elder");
    expect(staffRole.safeParse("deacon").success).toBe(false);
    expect(staffRole.safeParse("Elder").success).toBe(false);
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

  it("carries no status: the site lists only the published", () => {
    expect(staffMember.parse({ ...MEMBER, status: "draft" })).toEqual(MEMBER);
  });
});

describe("staffMembers", () => {
  it("is a list of members", () => {
    expect(staffMembers.parse([MEMBER])).toEqual([MEMBER]);
    expect(staffMembers.safeParse([{ name: "Jane Doe" }]).success).toBe(false);
  });
});

describe("staffRecord", () => {
  it("needs what a member needs, and their status and timestamps", () => {
    expect(staffRecord.parse(RECORD)).toEqual(RECORD);
    for (const key of [
      "id",
      "name",
      "role",
      "status",
      "createdAt",
      "updatedAt",
    ]) {
      const { [key]: _gone, ...without } = RECORD as Record<string, unknown>;
      expect(staffRecord.safeParse(without).success, key).toBe(false);
    }
  });

  it("accepts all a member can say, the bio as the tree the editor wrote", () => {
    const value = {
      ...RECORD,
      summary: "Has served since 2010.",
      bio: BIO,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      status: "published",
    };
    expect(staffRecord.parse(value)).toEqual(value);
    expect(
      staffRecord.safeParse({ ...RECORD, bio: "## Jane\n\nHas served." })
        .success,
    ).toBe(false);
  });

  it("names a member by a whole number from one", () => {
    expect(staffRecord.safeParse({ ...RECORD, id: 0 }).success).toBe(false);
    expect(staffRecord.safeParse({ ...RECORD, id: "1" }).success).toBe(false);
  });

  it("says when the row was written and changed as a moment, in UTC", () => {
    expect(
      staffRecord.safeParse({ ...RECORD, createdAt: "2026-10-17" }).success,
    ).toBe(false);
  });

  it("rejects a status or a role that is not one", () => {
    expect(staffRecord.safeParse({ ...RECORD, status: "hidden" }).success).toBe(
      false,
    );
    expect(staffRecord.safeParse({ ...RECORD, role: "deacon" }).success).toBe(
      false,
    );
  });
});

describe("staffListing", () => {
  it("is a page of records and how many there are in all", () => {
    const page = { items: [RECORD], total: 1 };
    expect(staffListing.parse(page)).toEqual(page);
    expect(staffListing.safeParse({ items: [MEMBER], total: 1 }).success).toBe(
      false,
    );
  });
});
