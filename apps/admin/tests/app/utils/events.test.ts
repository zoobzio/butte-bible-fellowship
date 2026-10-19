import { describe, expect, it } from "vitest";

import { DINNER, WORSHIP } from "#test/support/records";
import { parseWeeks, toEventBody, toEventDraft } from "~/utils/events";

describe("parseWeeks", () => {
  it("reads the weeks as they are typed, by comma or by space", () => {
    expect(parseWeeks("1, 3")).toEqual([1, 3]);
    expect(parseWeeks("1 3")).toEqual([1, 3]);
    expect(parseWeeks(" 2,4 ")).toEqual([2, 4]);
  });

  it("is every week when nothing is typed", () => {
    expect(parseWeeks("")).toBeUndefined();
    expect(parseWeeks("  ")).toBeUndefined();
  });

  it("keeps what is not a number, for the schema to refuse", () => {
    expect(parseWeeks("1, first")).toEqual([1, "first"]);
  });
});

describe("toEventDraft", () => {
  it("is blank for a new event: held once, a draft", () => {
    expect(toEventDraft()).toEqual({
      slug: "",
      title: "",
      note: "",
      summary: "",
      body: "",
      image: "",
      location: "",
      kind: "once",
      date: "",
      day: "sunday",
      weeks: "",
      start: "",
      end: "",
      status: "draft",
    });
  });

  it("holds a weekly event with its day and weeks", () => {
    expect(toEventDraft(WORSHIP)).toMatchObject({
      kind: "weekly",
      day: "sunday",
      weeks: "1, 3",
      date: "",
      start: "10:00",
      end: "11:30",
      status: "published",
    });
  });

  it("holds a one-off with its date", () => {
    expect(toEventDraft(DINNER)).toMatchObject({
      kind: "once",
      date: "2026-10-24",
      day: "sunday",
      weeks: "",
      location: "Fellowship Hall",
      note: "Bring a dish.",
      end: "",
      status: "draft",
    });
  });
});

describe("toEventBody", () => {
  it("writes a one-off with its date and no day", () => {
    expect(toEventBody(toEventDraft(DINNER))).toEqual({
      slug: "harvest-dinner",
      title: "Harvest Dinner",
      note: "Bring a dish.",
      location: "Fellowship Hall",
      date: "2026-10-24",
      start: "17:30",
      status: "draft",
    });
  });

  it("writes a weekly event with its day and weeks and no date", () => {
    expect(
      toEventBody({ ...toEventDraft(WORSHIP), date: "2026-10-24" }),
    ).toEqual({
      slug: "worship-service",
      title: "Worship Service",
      summary: "We gather on Sunday morning.",
      day: "sunday",
      weeks: [1, 3],
      start: "10:00",
      end: "11:30",
      status: "published",
    });
  });

  it("leaves the weeks out when none are typed", () => {
    expect(
      toEventBody({ ...toEventDraft(WORSHIP), weeks: "" }).weeks,
    ).toBeUndefined();
  });

  it("throws the issues of a draft the schema refuses", () => {
    expect(() => toEventBody({ ...toEventDraft(DINNER), date: "" })).toThrow();
    expect(() =>
      toEventBody({ ...toEventDraft(WORSHIP), weeks: "first" }),
    ).toThrow();
    expect(() =>
      toEventBody({ ...toEventDraft(WORSHIP), end: "09:00" }),
    ).toThrow();
  });
});
