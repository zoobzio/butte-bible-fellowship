import type { EventRecord } from "@bbf/schema/types";

import { eventBody, eventForm } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toEventBody, toEventForm } from "../../src/vm/event";

const STAMPS = {
  id: 7,
  createdAt: "2026-10-17T18:00:00.000Z",
  updatedAt: "2026-10-18T09:30:00.000Z",
};

const WEEKLY: EventRecord = {
  ...STAMPS,
  slug: "worship-service",
  title: "Worship Service",
  date: "2026-01-04",
  day: "sunday",
  recurring: true,
  start: "10:00",
};

const ONCE: EventRecord = {
  ...STAMPS,
  slug: "work-day",
  title: "Work Day",
  summary: "A morning's work on the grounds.",
  date: "2026-10-17",
  day: "saturday",
  recurring: false,
  start: "08:00",
  end: "12:00",
};

const BODY = {
  type: "root" as const,
  children: [
    {
      type: "element" as const,
      tagName: "p",
      properties: {},
      children: [{ type: "text" as const, value: "Bring gloves." }],
    },
  ],
};

/** What a record's details are: what a body writes of it. */
const details = (record: EventRecord) => {
  const {
    id: _id,
    createdAt: _c,
    updatedAt: _u,
    day: _d,
    body: _b,
    image: _i,
    ...written
  } = record;
  return written;
};

describe("toEventForm", () => {
  it("builds what a form holds, leaving out what the record has not", () => {
    expect(toEventForm(WEEKLY)).toEqual({
      slug: "worship-service",
      title: "Worship Service",
      date: "2026-01-04",
      recurring: true,
      start: "10:00",
    });
  });

  it("carries the details the record has, and neither its picture nor what is written about it", () => {
    expect(
      toEventForm({
        ...ONCE,
        body: BODY,
        image: "https://cdn.example.com/events/work-day.jpg",
      }),
    ).toEqual(details(ONCE));
  });

  it("leaves the record's id, its timestamps and the day its date falls on behind", () => {
    const form = toEventForm(WEEKLY);
    for (const key of ["id", "day", "createdAt", "updatedAt"]) {
      expect(form).not.toHaveProperty(key);
    }
  });

  it("holds each week as a select writes it", () => {
    expect(toEventForm({ ...WEEKLY, weeks: [1, 3] }).weeks).toEqual(["1", "3"]);
    expect(toEventForm({ ...WEEKLY, weeks: [] }).weeks).toEqual([]);
    expect(toEventForm({ ...WEEKLY, weeks: [2, 9] }).weeks).toEqual(["2"]);
  });

  it("builds what the form's schema accepts", () => {
    for (const record of [WEEKLY, ONCE, { ...WEEKLY, weeks: [1, 3] }]) {
      const form = toEventForm(record);
      expect(eventForm.parse(form)).toEqual(form);
    }
  });
});

describe("toEventBody", () => {
  it("builds a body, leaving out what the form leaves blank", () => {
    expect(
      toEventBody({
        slug: " worship-service ",
        title: " Worship Service ",
        summary: " ",
        date: "2026-01-04",
        recurring: true,
        weeks: [],
        start: "10:00",
        end: "",
      }),
    ).toEqual({
      slug: "worship-service",
      title: "Worship Service",
      date: "2026-01-04",
      recurring: true,
      start: "10:00",
    });
  });

  it("carries what is written, trimmed", () => {
    expect(
      toEventBody({
        slug: "work-day",
        title: "Work Day",
        summary: " A morning's work. ",
        date: "2026-10-17",
        recurring: false,
        start: "08:00",
        end: "12:00",
      }),
    ).toEqual({
      slug: "work-day",
      title: "Work Day",
      summary: "A morning's work.",
      date: "2026-10-17",
      recurring: false,
      start: "08:00",
      end: "12:00",
    });
  });

  it("writes the weeks picked as numbers, in order", () => {
    const form = toEventForm(WEEKLY);
    expect(toEventBody({ ...form, weeks: ["3", "1"] }).weeks).toEqual([1, 3]);
    expect(toEventBody({ ...form, weeks: [] }).weeks).toBeUndefined();
  });

  it("round trips a record's details through the form", () => {
    for (const record of [WEEKLY, ONCE, { ...WEEKLY, weeks: [1, 3] }]) {
      const body = toEventBody(toEventForm(record));
      expect(body).toEqual(details(record));
      expect(eventBody.parse(body)).toEqual(body);
    }
  });
});
