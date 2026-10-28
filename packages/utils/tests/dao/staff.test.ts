import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffArguments } from "../../src/dao/staff";

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Serving since 2010." }],
    },
  ],
};

describe("toStaffArguments", () => {
  it("writes what a body leaves out as null, a draft", () => {
    const body = staffBody.parse({ name: "Jane Doe", role: "elder" });
    expect(toStaffArguments(body)).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: null,
      bio: null,
      photo: null,
      email: null,
      phone: null,
      status: "draft",
    });
  });

  it("carries every field a body says, the bio as the tree", () => {
    const value = {
      name: "Jane Doe",
      role: "pastor",
      summary: "Serving since 2010.",
      bio: BIO,
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
      email: "jane@example.com",
      phone: "530-555-0100",
      status: "published",
    };
    expect(toStaffArguments(staffBody.parse(value))).toEqual(value);
  });
});
