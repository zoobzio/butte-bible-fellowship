import type { EventBody, EventRecord } from "@bbf/schema/types";

import type { EventDraft } from "~/types/events";

import { eventBody } from "@bbf/schema";

const written = (value: string): string | undefined => {
  const text = value.trim();
  return text === "" ? undefined : text;
};

export const parseWeeks = (text: string): (number | string)[] | undefined => {
  const parts = text
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length === 0) return undefined;
  return parts.map((part) => (/^\d+$/.test(part) ? Number(part) : part));
};

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
