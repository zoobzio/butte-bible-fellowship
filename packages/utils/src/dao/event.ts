import type { EventBody } from "@bbf/schema/types";

import type { EventArguments } from "../types";

export const toEventArguments = (body: EventBody): EventArguments => ({
  slug: body.slug,
  title: body.title,
  summary: body.summary ?? null,
  date: body.date,
  recurring: body.recurring,
  weeks: body.weeks ?? null,
  start: body.start,
  end: body.end ?? null,
});
