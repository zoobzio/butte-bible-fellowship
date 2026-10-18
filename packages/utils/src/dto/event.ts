import type { ChurchEvent } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { EventRow } from "../types";

/** A time as Postgres writes it, `HH:MM:SS`, as the API says it, `HH:MM`. */
const toEventTime = (time: string): string => time.slice(0, 5);

/**
 * The weeks of the month a row names, as the model lists them. Null is every
 * week, which the model says by leaving them out; a null among them names
 * no week, and is dropped.
 */
const toWeeks = (weeks: EventRow["weeks"]): number[] | undefined =>
  weeks?.filter((week): week is number => week !== null);

/**
 * An event as the API serves it, from a row of the events. A column the
 * row has null in, or a list's row has not, the event leaves out; the body,
 * written as Markdown, goes out as the tree the app renders; its times lose
 * their seconds, as `start_time` and `end_time` are written to the minute.
 * An admin row's `id`, `status` and timestamps keep it, and are not what
 * the site shows: the model carries none of them.
 */
export const toChurchEvent = (row: EventRow): ChurchEvent => ({
  slug: row.slug,
  title: row.title,
  note: row.note ?? undefined,
  summary: row.summary ?? undefined,
  body: row.body == null ? undefined : toHast(row.body),
  image: row.image ?? undefined,
  location: row.location ?? undefined,
  date: row.date ?? undefined,
  day: row.day ?? undefined,
  weeks: toWeeks(row.weeks),
  start: toEventTime(row.start_time),
  end: row.end_time === null ? undefined : toEventTime(row.end_time),
});
