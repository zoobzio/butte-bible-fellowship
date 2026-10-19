import type { ContentStatus, EventDay } from "@bbf/schema/types";

/** How an event is held: once, on a date, or every week on a day. */
export type EventKind = "once" | "weekly";

/**
 * An event as the editor holds it: every field of its body as a control's
 * value, a string where the body may leave one out. The `kind` says which
 * of the date and the day the body is written with; the `weeks` are
 * written as they are typed, `1, 3`, until the body is built.
 */
export interface EventDraft {
  slug: string;
  title: string;
  note: string;
  summary: string;
  body: string;
  image: string;
  location: string;
  kind: EventKind;
  date: string;
  day: EventDay;
  weeks: string;
  start: string;
  end: string;
  status: ContentStatus;
}
