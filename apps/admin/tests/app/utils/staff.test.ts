import { describe, expect, it } from "vitest";

import { BIO, STAFF } from "#test/support/records";
import { toStaffBody, toStaffDraft } from "~/utils/staff";

describe("toStaffDraft", () => {
  it("is blank for a new member: a draft, with no role yet", () => {
    expect(toStaffDraft()).toEqual({
      name: "",
      role: "",
      summary: "",
      bio: undefined,
      photo: "",
      email: "",
      phone: "",
      status: "draft",
    });
  });

  it("holds a record's fields, an empty string for what it left out", () => {
    expect(toStaffDraft(STAFF)).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: "Has served since 2010.",
      bio: BIO,
      photo: "",
      email: "jane@example.com",
      phone: "",
      status: "published",
    });
  });
});

describe("toStaffBody", () => {
  it("writes what is held, trimmed, and leaves out what is empty", () => {
    expect(
      toStaffBody({
        ...toStaffDraft(),
        name: "Jane Doe ",
        role: "elder",
        phone: "  ",
        email: "jane@example.com",
        status: "published",
      }),
    ).toEqual({
      name: "Jane Doe",
      role: "elder",
      email: "jane@example.com",
      status: "published",
    });
  });

  it("round-trips a record", () => {
    expect(toStaffBody(toStaffDraft(STAFF))).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: "Has served since 2010.",
      bio: BIO,
      email: "jane@example.com",
      status: "published",
    });
  });

  it("throws the issues of a draft the schema refuses", () => {
    expect(() => toStaffBody({ ...toStaffDraft(), name: "Jane" })).toThrow(
      /role/,
    );
    expect(() =>
      toStaffBody({
        ...toStaffDraft(),
        name: "Jane",
        role: "staff",
        photo: "not a url",
      }),
    ).toThrow(/photo/);
  });
});
