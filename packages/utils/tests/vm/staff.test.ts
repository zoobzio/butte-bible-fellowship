import type { Hast, StaffRecord } from "@bbf/schema/types";

import { staffBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toStaffBody, toStaffForm } from "../../src/vm/staff";

const BIO: Hast = {
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

const RECORD = {
  id: 7,
  name: "Jane Doe",
  role: "elder" as const,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toStaffForm", () => {
  it("builds what a form holds, leaving out what the record has not", () => {
    expect(toStaffForm(RECORD)).toEqual({ name: "Jane Doe", role: "elder" });
  });

  it("carries the details the record has, and neither its photo nor its bio", () => {
    expect(
      toStaffForm({
        ...RECORD,
        summary: "Serving since 2010.",
        bio: BIO,
        photo: "https://cdn.example.com/staff/jane-doe.jpg",
        email: "j@x.org",
        phone: "530-555-0100",
      }),
    ).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
    });
  });

  it("leaves the record's id and timestamps behind", () => {
    const form = toStaffForm(RECORD);
    expect(form).not.toHaveProperty("id");
    expect(form).not.toHaveProperty("createdAt");
    expect(form).not.toHaveProperty("updatedAt");
  });
});

describe("toStaffBody", () => {
  it("builds a body, leaving out what the form leaves blank", () => {
    expect(
      toStaffBody({
        name: " Jane Doe ",
        role: "elder",
        summary: " ",
        email: "",
        phone: "",
      }),
    ).toEqual({ name: "Jane Doe", role: "elder" });
  });

  it("carries what is written, trimmed", () => {
    expect(
      toStaffBody({
        name: "Jane Doe",
        role: "elder",
        summary: " Serving since 2010. ",
        email: "j@x.org",
        phone: "530-555-0100",
      }),
    ).toEqual({
      name: "Jane Doe",
      role: "elder",
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
    });
  });

  it("builds what the schema accepts", () => {
    const body = toStaffBody({
      name: "Jane Doe",
      role: "elder",
      email: "j@x.org",
    });
    expect(staffBody.parse(body)).toEqual(body);
  });

  it("round trips a record's details through the form", () => {
    const record: StaffRecord = {
      ...RECORD,
      bio: BIO,
      summary: "x",
      email: "j@x.org",
    };
    const { id: _id, createdAt: _c, updatedAt: _u, bio: _b, ...body } = record;
    expect(toStaffBody(toStaffForm(record))).toEqual(body);
  });
});
