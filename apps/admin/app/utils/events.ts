import type { EventBody, EventRecord } from "@bbf/schema/types";

import type { EventDraft } from "~/types/events";

import { eventBody } from "@bbf/schema";

/** A control's value as the body takes it: trimmed, and left out when empty. */
const written = (value: string): string | undefined => {
  const text = value.trim();
  return text === "" ? undefined : text;
};

/**
 * The weeks of the month as they are typed, `1, 3`, as the body lists
 * them. Nothing typed is every week, which the body says by leaving them
 * out; what is typed and is not a number stays as it is, for the schema to
 * refuse by name.
 */
export const parseWeeks = (text: string): (number | string)[] | undefined => {
  const parts = text
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length === 0) return undefined;
  return parts.map((part) => (/^\d+$/.test(part) ? Number(part) : part));
};

/**
 * An event as the editor holds it, from its record, or blank for a new one:
 * a draft held once, on no date yet, with every control empty.
 */
export const toEventDraft = (record?: EventRecord): EventDraft => ({
  slug: record?.slug ?? "",
  title: record?.title ?? "",
  note: record?.note ?? "",
  summary: record?.summary ?? "",
  body: record?.body ?? "",
  image: record?.image ?? "",
  location: record?.location ?? "",
  kind: record?.day === undefined ? "once" : "weekly",
  date: record?.date ?? "",
  day: record?.day ?? "sunday",
  weeks: record?.weeks?.join(", ") ?? "",
  start: record?.start ?? "",
  end: record?.end ?? "",
  status: record?.status ?? "draft",
});

/**
 * The body an event is written from, as the schema checks it, from what
 * the editor holds. The kind decides what is written: an event held once
 * is written with its date and no day, a weekly one with its day and weeks
 * and no date. A control left empty is left out. A draft the schema
 * refuses throws its issues.
 */
export const toEventBody = (draft: EventDraft): EventBody =>
  eventBody.parse({
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    note: written(draft.note),
    summary: written(draft.summary),
    body: written(draft.body),
    image: written(draft.image),
    location: written(draft.location),
    ...(draft.kind === "once"
      ? { date: written(draft.date) }
      : { day: draft.day, weeks: parseWeeks(draft.weeks) }),
    start: draft.start,
    end: written(draft.end),
    status: draft.status,
  });
