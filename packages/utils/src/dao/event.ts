import type { EventBody } from "@bbf/schema/types";

import type { EventArguments } from "../types";

export const toEventArguments = (body: EventBody): EventArguments => ({
  slug: body.slug,
  title: body.title,
  note: body.note ?? null,
  summary: body.summary ?? null,
  body: body.body ?? null,
  image: body.image ?? null,
  location: body.location ?? null,
  date: body.date ?? null,
  day: body.day ?? null,
  weeks: body.weeks ?? null,
  start: body.start,
  end: body.end ?? null,
  status: body.status,
});
