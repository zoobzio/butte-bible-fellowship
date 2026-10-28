import type { ChurchEvent, EventRecord } from "@bbf/schema/types";

import { toHast } from "./hast";
import type { EventRecordRow, EventRow } from "../types";

// Postgres returns `HH:MM:SS`. The API uses `HH:MM`.
const toEventTime = (time: string): string => time.slice(0, 5);

const toWeeks = (weeks: EventRow["weeks"]): number[] | undefined =>
  weeks?.filter((week): week is number => week !== null);

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

export const toEventRecord = (row: EventRecordRow): EventRecord => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  note: row.note ?? undefined,
  summary: row.summary ?? undefined,
  body: row.body ?? undefined,
  image: row.image ?? undefined,
  location: row.location ?? undefined,
  date: row.date ?? undefined,
  day: row.day ?? undefined,
  weeks: toWeeks(row.weeks),
  start: toEventTime(row.start_time),
  end: row.end_time === null ? undefined : toEventTime(row.end_time),
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
