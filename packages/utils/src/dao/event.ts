import type { EventBody } from "@bbf/schema/types";

import type { EventArguments } from "../types";

/**
 * What writing an event takes, from the body a request carries. A field
 * the body leaves out is written as null: a `date` or a `day` the event
 * has not, `weeks` when it is held every week. For `admin.events.update`,
 * spread it with the `id` of the event it replaces.
 */
export const toEventArguments = (body: EventBody): EventArguments => ({
  slug: body.slug,
  title: body.title,
  note: body.note ?? null,
  location: body.location ?? null,
  date: body.date ?? null,
  day: body.day ?? null,
  weeks: body.weeks ?? null,
  start: body.start,
  end: body.end ?? null,
});
