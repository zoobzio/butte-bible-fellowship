import { describe, expect, it } from "vitest";

import { STAFF } from "#test/support/records";
import { toStaffBody, toStaffDraft } from "~/utils/staff";

describe("toStaffDraft", () => {
  it("is blank for a new member: a draft, last in the list", () => {
    expect(toStaffDraft()).toEqual({
      slug: "",
      name: "",
      role: "",
      summary: "",
      bio: "",
      photo: "",
      email: "",
      phone: "",
      position: 0,
      status: "draft",
    });
  });

  it("holds a record's fields, an empty string for what it left out", () => {
    expect(toStaffDraft(STAFF)).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      summary: "Has served since 2010.",
      bio: "## Jane\n\nHas served since 2010.",
      photo: "",
      email: "jane@example.com",
      phone: "",
      position: 2,
      status: "published",
    });
  });
});

describe("toStaffBody", () => {
  it("writes what is held, trimmed, and leaves out what is empty", () => {
    expect(
      toStaffBody({
        ...toStaffDraft(),
        slug: " jane-doe ",
        name: "Jane Doe ",
        role: "Elder",
        phone: "  ",
        email: "jane@example.com",
        position: 3,
        status: "published",
      }),
    ).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      email: "jane@example.com",
      position: 3,
      status: "published",
    });
  });

  it("round-trips a record", () => {
    expect(toStaffBody(toStaffDraft(STAFF))).toEqual({
      slug: "jane-doe",
      name: "Jane Doe",
      role: "Elder",
      summary: "Has served since 2010.",
      bio: "## Jane\n\nHas served since 2010.",
      email: "jane@example.com",
      position: 2,
      status: "published",
    });
  });

  it("throws the issues of a draft the schema refuses", () => {
    expect(() =>
      toStaffBody({ ...toStaffDraft(), slug: "Jane Doe", name: "Jane" }),
    ).toThrow();
    expect(() =>
      toStaffBody({
        ...toStaffDraft(),
        slug: "jane",
        name: "Jane",
        role: "x",
        photo: "not a url",
      }),
    ).toThrow();
  });
});
