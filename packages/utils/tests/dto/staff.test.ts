import { staffMember } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffMember } from "../../src/dto/staff";

/** A row as `web.staff.list` returns it. */
const ROW = {
  slug: "jane-doe",
  name: "Jane Doe",
  role: "Elder",
  bio: null,
  photo: "/staff/jane-doe.jpg",
  email: null,
};

describe("toStaffMember", () => {
  it("builds a member, leaving out what the row has null in", () => {
    expect(toStaffMember(ROW)).toEqual({
      name: "Jane Doe",
      role: "Elder",
      photo: "/staff/jane-doe.jpg",
    });
  });

  it("carries a bio and an email when the row has them", () => {
    expect(
      toStaffMember({ ...ROW, bio: "Serving since 2010.", email: "j@x.org" }),
    ).toMatchObject({ bio: "Serving since 2010.", email: "j@x.org" });
  });

  it("leaves the slug and position behind: the model has neither", () => {
    const row = { ...ROW, id: 1, position: 2 };
    const member = toStaffMember(row);
    expect(member).not.toHaveProperty("slug");
    expect(member).not.toHaveProperty("position");
    expect(member).not.toHaveProperty("id");
  });

  it("builds what the schema accepts", () => {
    expect(staffMember.safeParse(toStaffMember(ROW)).success).toBe(true);
  });
});
