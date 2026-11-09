import type { EventBody, EventForm, EventRecord } from "@bbf/schema/types";

import { EVENT_WEEKS } from "@bbf/schema";
import { within } from "objectively";

const written = (value: string | undefined): string | undefined => {
  const text = value?.trim() ?? "";
  return text === "" ? undefined : text;
};

/**
 * The weeks a record holds as a form's select writes them: each a string,
 * and none for an event held every week. A week the form does not offer is
 * left behind.
 */
const toFormWeeks = (weeks: number[] | undefined): EventForm["weeks"] =>
  weeks?.flatMap((week) => {
    const value = String(week);
    return within(EVENT_WEEKS, value) ? [value] : [];
  });

/**
 * The weeks a form holds as a body writes them: each a number, in order,
 * and none picked is every week, which a body says by leaving them out.
 */
const toBodyWeeks = (weeks: EventForm["weeks"]): number[] | undefined =>
  weeks === undefined || weeks.length === 0
    ? undefined
    : weeks.map(Number).sort((a, b) => a - b);

export const toEventForm = (record: EventRecord): EventForm => ({
  slug: record.slug,
  title: record.title,
  summary: record.summary,
  date: record.date,
  recurring: record.recurring,
  weeks: toFormWeeks(record.weeks),
  start: record.start,
  end: record.end,
});

export const toEventBody = (form: EventForm): EventBody => ({
  slug: form.slug.trim(),
  title: form.title.trim(),
  summary: written(form.summary),
  date: form.date,
  recurring: form.recurring,
  weeks: toBodyWeeks(form.weeks),
  start: form.start,
  end: written(form.end),
});
