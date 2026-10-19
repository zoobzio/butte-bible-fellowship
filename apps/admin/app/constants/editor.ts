import type { ContentStatus, EventDay } from "@bbf/schema/types";

import type { EventKind } from "~/types/events";

/** A choice a control offers: what it is worth, and what it is called. */
interface Choice<T extends string> {
  value: T;
  label: string;
}

/** The statuses content passes through, as the editor names them. */
export const STATUS_OPTIONS: Choice<ContentStatus>[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

/** The days of the week an event can repeat on, Sunday first. */
export const DAY_OPTIONS: Choice<EventDay>[] = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

/** The two ways an event is held, as the editor offers them. */
export const KIND_OPTIONS: Choice<EventKind>[] = [
  { value: "once", label: "Held once, on a date" },
  { value: "weekly", label: "Repeats every week" },
];

/** What the editor asks before it deletes a record. */
export const DELETE_PROMPT = "This cannot be undone.";
