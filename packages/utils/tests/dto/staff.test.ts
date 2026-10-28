import { staffMember, staffRecord } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffMember, toStaffRecord } from "../../src/dto/staff";

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "h2",
      properties: {},
      children: [{ type: "text", value: "Jane" }],
    },
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Serving since 2010." }],
    },
  ],
};

const ROW = {
  id: 1,
  name: "Jane Doe",
  role: "elder" as const,
  summary: null,
  bio: null,
  photo: "https://cdn.example.com/staff/jane-doe.jpg",
  email: null,
  phone: null,
};

describe("toStaffMember", () => {
  it("builds a member, leaving out what the row has null in", () => {
    expect(toStaffMember(ROW)).toEqual({
      id: 1,
      name: "Jane Doe",
      role: "elder",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
    });
  });

  it("carries what else the row has", () => {
    expect(
      toStaffMember({
        ...ROW,
        summary: "Serving since 2010.",
        bio: BIO,
        email: "j@x.org",
        phone: "530-555-0100",
      }),
    ).toMatchObject({
      summary: "Serving since 2010.",
      bio: BIO,
      email: "j@x.org",
      phone: "530-555-0100",
    });
  });

  it("serves the bio as the tree it was stored as, and refuses one that is not", () => {
    const member = toStaffMember({ ...ROW, bio: BIO });
    expect(member.bio).toEqual(BIO);
    expect(staffMember.safeParse(member).success).toBe(true);
    expect(() => toStaffMember({ ...ROW, bio: "## Jane" })).toThrow();
  });

  it("leaves an admin row's status behind", () => {
    const row = { ...ROW, status: "published" };
    const member = toStaffMember(row);
    expect(member).not.toHaveProperty("status");
  });

  it("builds what the schema accepts", () => {
    expect(staffMember.safeParse(toStaffMember(ROW)).success).toBe(true);
  });
});

const ADMIN_ROW = {
  ...ROW,
  id: 7,
  status: "draft" as const,
  created_at: new Date("2026-10-17T18:00:00Z"),
  updated_at: new Date("2026-10-18T09:30:00Z"),
};

describe("toStaffRecord", () => {
  it("builds a record, leaving out what the row has null in", () => {
    expect(toStaffRecord(ADMIN_ROW)).toEqual({
      id: 7,
      name: "Jane Doe",
      role: "elder",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      status: "draft",
      createdAt: "2026-10-17T18:00:00.000Z",
      updatedAt: "2026-10-18T09:30:00.000Z",
    });
  });

  it("keeps the bio as the tree it was stored as", () => {
    expect(toStaffRecord({ ...ADMIN_ROW, bio: BIO })).toMatchObject({
      bio: BIO,
    });
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
