import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffArguments } from "../../src/dao/staff";

describe("toStaffArguments", () => {
  it("writes what a body leaves out as null, a draft last in the list", () => {
    const body = staffBody.parse({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
    });
    expect(toStaffArguments(body)).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      summary: null,
      bio: null,
      photo: null,
      email: null,
      phone: null,
      position: 0,
      status: "draft",
    });
  });

  it("carries every field a body says", () => {
    const value = {
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Pastor",
      summary: "Serving since 2010.",
      bio: "## Jane\n\nServing since 2010.",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      position: 3,
      status: "published",
    };
    expect(toStaffArguments(staffBody.parse(value))).toEqual(value);
  });
});
