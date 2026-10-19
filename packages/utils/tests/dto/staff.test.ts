import { staffMember, staffRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffMember, toStaffRecord } from "../../src/dto/staff";

/** A row as `web.staff.list` returns it. */
const ROW = {
  slug: "jane-doe",
  name: "Jane Doe",
  role: "Elder",
  summary: null,
  bio: null,
  photo: "https://cdn.example.com/staff/jane-doe.jpg",
  email: null,
  phone: null,
};

describe("toStaffMember", () => {
  it("builds a member, leaving out what the row has null in", () => {
    expect(toStaffMember(ROW)).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
    });
  });

  it("carries what else the row has", () => {
    expect(
      toStaffMember({
        ...ROW,
        summary: "Serving since 2010.",
        bio: "## Jane\n\nServing since 2010.",
        email: "j@x.org",
        phone: "530-555-0100",
      }),
    ).toMatchObject({
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
    });
  });

  it("serves the bio as the tree the app renders, not the Markdown", () => {
    const member = toStaffMember({
      ...ROW,
      bio: "## Jane\n\nServing since 2010.",
    });
    expect(member.bio).toEqual({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "jane" },
          children: [{ type: "text", value: "Jane" }],
        },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "Serving since 2010." }],
        },
      ],
    });
    expect(staffMember.safeParse(member).success).toBe(true);
  });

  it("leaves an admin row's id, position and status behind", () => {
    const row = { ...ROW, id: 1, position: 2, status: "published" };
    const member = toStaffMember(row);
    expect(member).not.toHaveProperty("id");
    expect(member).not.toHaveProperty("position");
    expect(member).not.toHaveProperty("status");
  });

  it("builds what the schema accepts", () => {
    expect(staffMember.safeParse(toStaffMember(ROW)).success).toBe(true);
  });
});

/** A row as `admin.staff.fetch` returns it: every column, the timestamps as dates. */
const ADMIN_ROW = {
  ...ROW,
  id: 7,
  position: 2,
  status: "draft" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

describe("toStaffRecord", () => {
  it("builds a record, leaving out what the row has null in", () => {
    expect(toStaffRecord(ADMIN_ROW)).toEqual({
      id: 7,
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      position: 2,
      status: "draft",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
  });

  it("keeps the bio as the Markdown it was written as", () => {
    expect(
      toStaffRecord({ ...ADMIN_ROW, bio: "## Jane\n\nServing since 2010." }),
    ).toMatchObject({ bio: "## Jane\n\nServing since 2010." });
  });

  it("carries what else the row has", () => {
    expect(
      toStaffRecord({
        ...ADMIN_ROW,
        summary: "Serving since 2010.",
        email: "j@x.org",
        phone: "530-555-0100",
        status: "published",
      }),
    ).toMatchObject({
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
      status: "published",
    });
  });

  it("builds what the schema accepts", () => {
    expect(staffRecord.safeParse(toStaffRecord(ADMIN_ROW)).success).toBe(true);
  });
});
