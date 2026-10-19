import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { failure, isNotFound } from "~/utils/errors";

describe("isNotFound", () => {
  it("knows a fetch that found nothing, whichever way it says so", () => {
    expect(isNotFound({ status: 404 })).toBe(true);
    expect(isNotFound({ statusCode: 404 })).toBe(true);
    expect(isNotFound({ status: 500 })).toBe(false);
    expect(isNotFound(new Error("x"))).toBe(false);
    expect(isNotFound(null)).toBe(false);
  });
});

describe("failure", () => {
  it("says each issue of a body the schema refused, with its field", () => {
    const { error } = staffBody.safeParse({ slug: "Jane Doe", name: "Jane" });
    const said = failure(error);
    expect(said).toContain("slug:");
    expect(said).toContain("role:");
  });

  it("says the issues the server refused a body for", () => {
    expect(
      failure({
        status: 400,
        data: {
          statusCode: 400,
          message: "Validation Error",
          data: {
            issues: [{ path: ["email"], message: "Invalid email address" }],
          },
        },
      }),
    ).toBe("email: Invalid email address");
  });

  it("says an issue with no field as it is", () => {
    expect(failure({ issues: [{ path: [], message: "one of the two" }] })).toBe(
      "one of the two",
    );
  });

  it("says what the server said, when it said something", () => {
    expect(
      failure({ status: 404, data: { message: "Staff member not found" } }),
    ).toBe("Staff member not found");
  });

  it("says what an error says, or that something went wrong", () => {
    expect(failure(new Error("database unavailable"))).toBe(
      "database unavailable",
    );
    const silent = new Error("silent");
    silent.message = "";
    expect(failure(silent)).toBe("Something went wrong.");
    expect(failure("?")).toBe("Something went wrong.");
    expect(failure(undefined)).toBe("Something went wrong.");
  });
});
