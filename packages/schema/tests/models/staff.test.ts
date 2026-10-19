import { describe, expect, it } from "vitest";

import {
  CONTENT_STATUSES,
  contentStatus,
  staffListing,
  staffMember,
  staffMembers,
  staffRecord,
} from "../../src/models/staff";

const MEMBER = { slug: "jane-doe", name: "Jane Doe", role: "Elder" };

const RECORD = {
  id: 1,
  ...MEMBER,
  position: 0,
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

describe("staffMember", () => {
  it("needs a slug, a name and a role", () => {
    expect(staffMember.parse(MEMBER)).toEqual(MEMBER);
    expect(
      staffMember.safeParse({ name: "Jane Doe", role: "Elder" }).success,
    ).toBe(false);
    expect(
      staffMember.safeParse({ slug: "jane-doe", name: "Jane Doe" }).success,
    ).toBe(false);
  });

  it("accepts all a member can say", () => {
    const value = {
      ...MEMBER,
      role: "Pastor",
      summary: "Has served since 2010.",
      bio: {
        type: "root",
        children: [
          {
            type: "element",
            tagName: "p",
            properties: {},
            children: [{ type: "text", value: "Has served since 2010." }],
          },
        ],
      },
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
    };
    expect(staffMember.parse(value)).toEqual(value);
  });

  it("takes a bio as a tree, never as the Markdown it was written as", () => {
    expect(
      staffMember.safeParse({ ...MEMBER, bio: "## Jane\n\nHas served." })
        .success,
    ).toBe(false);
  });

  it("rejects an email, a photo or a slug that is not one", () => {
    expect(staffMember.safeParse({ ...MEMBER, email: "jane" }).success).toBe(
      false,
    );
    expect(
      staffMember.safeParse({ ...MEMBER, photo: "/staff/jane-doe.jpg" })
        .success,
    ).toBe(false);
    expect(staffMember.safeParse({ ...MEMBER, slug: "Jane Doe" }).success).toBe(
      false,
    );
  });

  it("carries no status or position: the site lists only the published", () => {
    expect(
      staffMember.parse({ ...MEMBER, status: "draft", position: 3 }),
    ).toEqual(MEMBER);
  });
});

describe("staffMembers", () => {
  it("is a list of members", () => {
    expect(staffMembers.parse([MEMBER])).toEqual([MEMBER]);
    expect(staffMembers.safeParse([{ name: "Jane Doe" }]).success).toBe(false);
  });
});

describe("staffRecord", () => {
  it("needs what a member needs, and their id, position, status and timestamps", () => {
    expect(staffRecord.parse(RECORD)).toEqual(RECORD);
    for (const key of ["id", "position", "status", "createdAt", "updatedAt"]) {
      const { [key]: _gone, ...without } = RECORD as Record<string, unknown>;
      expect(staffRecord.safeParse(without).success, key).toBe(false);
    }
  });

  it("accepts all a member can say, the bio as the Markdown it was written as", () => {
    const value = {
      ...RECORD,
      summary: "Has served since 2010.",
      bio: "## Jane\n\nHas served since 2010.",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      position: 2,
      status: "published",
    };
    expect(staffRecord.parse(value)).toEqual(value);
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

  it("rejects a status that is not one", () => {
    expect(staffRecord.safeParse({ ...RECORD, status: "hidden" }).success).toBe(
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
