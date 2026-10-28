import type { ContentStatus, EventDay } from "@bbf/schema/types";

export type EventKind = "once" | "weekly";

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
