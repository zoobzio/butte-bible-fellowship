import type { ContentStatus, EventDay } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { EventKind } from "~/types/events";

/**
 * A choice a control offers: what it is worth, and what it is called — a
 * message of `@bbf/prose`, by key, resolved where the choice is rendered.
 */
interface Choice<T extends string> {
  value: T;
  label: AppProsaryMessage;
}

/** The statuses content passes through, as the editor names them. */
export const STATUS_OPTIONS: Choice<ContentStatus>[] = [
  { value: "draft", label: "admin.editor.draft" },
  { value: "published", label: "admin.editor.published" },
  { value: "archived", label: "admin.editor.archived" },
];

/** The days of the week an event can repeat on, Sunday first. */
export const DAY_OPTIONS: Choice<EventDay>[] = [
  { value: "sunday", label: "admin.days.sunday" },
  { value: "monday", label: "admin.days.monday" },
  { value: "tuesday", label: "admin.days.tuesday" },
  { value: "wednesday", label: "admin.days.wednesday" },
  { value: "thursday", label: "admin.days.thursday" },
  { value: "friday", label: "admin.days.friday" },
  { value: "saturday", label: "admin.days.saturday" },
];

/** The two ways an event is held, as the editor offers them. */
export const KIND_OPTIONS: Choice<EventKind>[] = [
  { value: "once", label: "admin.event.once" },
  { value: "weekly", label: "admin.event.weekly" },
];
