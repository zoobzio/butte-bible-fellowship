import type { Hast, PersonRecord } from "@bbf/schema/types";

import { personBody } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toPersonBody, toPersonForm } from "../../src/vm/person";

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
  firstName: "Jane",
  lastName: "Doe",
  name: "Jane Doe",
  role: "elder" as const,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

describe("toPersonForm", () => {
  it("builds what a form holds, leaving out what the record has not", () => {
    expect(toPersonForm(RECORD)).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      role: "elder",
    });
  });

  it("carries the details the record has, and its photo, and not its bio", () => {
    expect(
      toPersonForm({
        ...RECORD,
        title: "Worship Director",
        summary: "Serving since 2010.",
        bio: BIO,
        photo: "https://cdn.example.com/staff/jane-doe.jpg",
        email: "j@x.org",
        phone: "530-555-0100",
        address: "123 Main St",
        birthday: "1980-04-12",
      }),
    ).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      role: "elder",
      title: "Worship Director",
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
      address: "123 Main St",
      birthday: "1980-04-12",
      photo: "https://cdn.example.com/staff/jane-doe.jpg",
    });
  });

  it("leaves the record's id and timestamps behind", () => {
    const form = toPersonForm(RECORD);
    expect(form).not.toHaveProperty("id");
    expect(form).not.toHaveProperty("createdAt");
    expect(form).not.toHaveProperty("updatedAt");
  });
});

describe("toPersonBody", () => {
  it("builds a body, leaving out what the form leaves blank", () => {
    expect(
      toPersonBody({
        firstName: " Jane ",
        lastName: " Doe ",
        role: "elder",
        title: " ",
        summary: " ",
        email: "",
        phone: "",
        address: "",
        birthday: "",
      }),
    ).toEqual({ firstName: "Jane", lastName: "Doe", role: "elder" });
  });

  it("carries what is written, trimmed", () => {
    expect(
      toPersonBody({
        firstName: "Jane",
        lastName: "Doe",
        role: "elder",
        title: " Worship Director ",
        summary: " Serving since 2010. ",
        email: "j@x.org",
        phone: "530-555-0100",
        address: " 123 Main St ",
        birthday: "1980-04-12",
      }),
    ).toEqual({
      firstName: "Jane",
      lastName: "Doe",
      role: "elder",
      title: "Worship Director",
      summary: "Serving since 2010.",
      email: "j@x.org",
      phone: "530-555-0100",
      address: "123 Main St",
      birthday: "1980-04-12",
    });
  });

  it("builds what the schema accepts", () => {
    const body = toPersonBody({
      firstName: "Jane",
      lastName: "Doe",
      role: "elder",
      email: "j@x.org",
    });
    expect(personBody.parse(body)).toEqual(body);
  });

  it("round trips a record's details through the form", () => {
    const record: PersonRecord = {
      ...RECORD,
      bio: BIO,
      summary: "x",
      email: "j@x.org",
    };
    const {
      id: _id,
      name: _n,
      createdAt: _c,
      updatedAt: _u,
      bio: _b,
      ...body
    } = record;
    expect(toPersonBody(toPersonForm(record))).toEqual(body);
  });
});
