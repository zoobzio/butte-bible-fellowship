import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffArguments } from "../../src/dao/staff";

describe("toStaffArguments", () => {
  it("writes what a body leaves out as null", () => {
    const body = staffBody.parse({ name: "Jane Doe", role: "elder" });
    expect(toStaffArguments(body)).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: null,
      email: null,
      phone: null,
    });
  });

  it("carries every field a body says", () => {
    const value = {
      name: "Jane Doe",
      role: "pastor",
      summary: "Serving since 2010.",
      email: "jane@example.com",
      phone: "530-555-0100",
    };
    expect(toStaffArguments(staffBody.parse(value))).toEqual(value);
  });
});
