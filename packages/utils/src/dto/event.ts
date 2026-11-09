import type { ChurchEvent, EventDay, EventRecord } from "@bbf/schema/types";

import { EVENT_DAYS, hast } from "@bbf/schema";

import type { EventRecordRow, EventRow } from "../types";

// Postgres returns `HH:MM:SS`. The API uses `HH:MM`.
const toEventTime = (time: string): string => time.slice(0, 5);

const toWeeks = (weeks: EventRow["weeks"]): number[] | undefined =>
  weeks?.filter((week): week is number => week !== null);

/**
 * The day of the week a date falls on, as an event names it. The date is
 * a calendar day, YYYY-MM-DD, read as itself and in no time zone.
 */
export const toEventDay = (date: string): EventDay =>
  EVENT_DAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]!;

/**
 * An event as the site reads it. A recurring one is known by the day of
 * the week its date falls on, and carries no date; one held once is known
 * by its date.
 */
export const toChurchEvent = (row: EventRow): ChurchEvent => ({
  slug: row.slug,
  title: row.title,
  summary: row.summary ?? undefined,
  body: row.body == null ? undefined : hast.parse(row.body),
  image: row.image ?? undefined,
  date: row.recurring ? undefined : row.date,
  day: row.recurring ? toEventDay(row.date) : undefined,
  weeks: toWeeks(row.weeks),
  start: toEventTime(row.start_time),
  end: row.end_time === null ? undefined : toEventTime(row.end_time),
});

export const toEventRecord = (row: EventRecordRow): EventRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  summary: row.summary ?? undefined,
  body: row.body === null ? undefined : hast.parse(row.body),
  image: row.image ?? undefined,
  date: row.date,
  day: toEventDay(row.date),
  recurring: row.recurring,
  weeks: toWeeks(row.weeks),
  start: toEventTime(row.start_time),
  end: row.end_time === null ? undefined : toEventTime(row.end_time),
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
