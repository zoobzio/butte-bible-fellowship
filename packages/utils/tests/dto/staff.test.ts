import { staffMember } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffMember } from "../../src/dto/staff";

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
      bio: "## Jane\n\nServing since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
    });
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
