import { describe, expect, it } from "vitest";

import {
  CONTENT_STATUSES,
  contentStatus,
  staffMember,
  staffMembers,
} from "../../src/models/staff";

const MEMBER = { slug: "jane-doe", name: "Jane Doe", role: "Elder" };

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
