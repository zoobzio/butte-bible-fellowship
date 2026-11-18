import type { EventDay, EventRecord, EventWindow } from "@bbf/schema/types";

import type { CalendarEntry, CalendarFetchParams } from "~/types/calendar";

import { toFilterQuery } from "~/utils/listing";

/** A day of the week as a calendar's rule names it. */
const WEEKDAYS = {
  sunday: "su",
  monday: "mo",
  tuesday: "tu",
  wednesday: "we",
  thursday: "th",
  friday: "fr",
  saturday: "sa",
} as const satisfies Record<EventDay, string>;

/** A time of day, HH:MM, as minutes from midnight. */
const minutes = (time: string): number =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * How long an event runs, as a calendar reads it: from its start to its
 * end, which the schema holds to after it. One with no end runs no time.
 */
export const toDuration = (start: string, end: string): string => {
  const span = minutes(end) - minutes(start);
  return `PT${Math.floor(span / 60)}H${span % 60}M`;
};

/**
 * How a recurring event repeats, as a calendar's rule: every week, or in
 * the weeks of the month it picks, the first Tuesday and the third, each
 * the nth of its day in the month, as the site counts them.
 */
const toRule = ({ day, weeks }: Pick<EventRecord, "day" | "weeks">) =>
  weeks === undefined || weeks.length === 0
    ? { frequency: "weekly" as const }
    : {
        frequency: "monthly" as const,
        byDay: weeks.map((week) => ({
          day: WEEKDAYS[day],
          nthOfPeriod: week,
        })),
      };

/**
 * An event as the calendar lays it out: held on its date from its start,
 * in the time zone given, the church's own, and on from there by its rule
 * when it recurs. It is known to the calendar by its row's number, which
 * is what leads back to its page.
 */
export const toEntry = (
  record: EventRecord,
  timeZone: string,
): CalendarEntry => ({
  "@type": "Event",
  uid: String(record.id),
  updated: record.updatedAt,
  title: record.title,
  ...(record.summary !== undefined && { description: record.summary }),
  start: `${record.date}T${record.start}:00`,
  timeZone,
  ...(record.end !== undefined && {
    duration: toDuration(record.start, record.end),
  }),
  ...(record.recurring && { recurrenceRule: toRule(record) }),
});

/**
 * What a calendar asks the API for: the first and the last of the days it
 * shows, the free text as `q`, and one filter per key, as a table's are
 * named.
 */
export const toWindowQuery = (
  days: string[],
  { query, filters }: Pick<CalendarFetchParams, "query" | "filters">,
): Record<string, string> & Pick<EventWindow, "from" | "to"> => ({
  ...toFilterQuery(filters),
  from: days[0]!,
  to: days.at(-1)!,
  ...(query === "" ? {} : { q: query }),
});
