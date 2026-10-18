import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffArguments } from "../../src/dao/staff";

describe("toStaffArguments", () => {
  it("writes what a body leaves out as null, and its position as given", () => {
    const body = staffBody.parse({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
    });
    expect(toStaffArguments(body)).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      bio: null,
      photo: null,
      email: null,
      position: 0,
    });
  });

  it("carries every field a body says", () => {
    const body = staffBody.parse({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Pastor",
      bio: "Serving since 2010.",
      photo: "/staff/jane-doe.jpg",
      email: "jane@example.com",
      position: 3,
    });
    expect(toStaffArguments(body)).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Pastor",
      bio: "Serving since 2010.",
      photo: "/staff/jane-doe.jpg",
      email: "jane@example.com",
      position: 3,
    });
  });
});
