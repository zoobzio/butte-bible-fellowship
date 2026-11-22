import { personBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toPersonArguments } from "../../src/dao/person";

describe("toPersonArguments", () => {
  it("writes what a body leaves out as null", () => {
    const body = personBody.parse({
      firstName: "Jane",
      lastName: "Doe",
      role: "elder",
    });
    expect(toPersonArguments(body)).toEqual({
      first_name: "Jane",
      last_name: "Doe",
      role: "elder",
      title: null,
      summary: null,
      email: null,
      phone: null,
      address: null,
      birthday: null,
    });
  });

  it("carries every field a body says", () => {
    const value = {
      role: "pastor",
      title: "Senior Pastor",
      summary: "Serving since 2010.",
      email: "jane@example.com",
      phone: "530-555-0100",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    };
    expect(
      toPersonArguments(
        personBody.parse({ ...value, firstName: "Jane", lastName: "Doe" }),
      ),
    ).toEqual({ ...value, first_name: "Jane", last_name: "Doe" });
  });
});
