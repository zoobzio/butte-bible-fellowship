import type { ContentStatus, EventDay } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { EventKind } from "~/types/events";

interface Choice<T extends string> {
  value: T;
  label: AppProsaryMessage;
}

export const STATUS_OPTIONS: Choice<ContentStatus>[] = [
  { value: "draft", label: "admin.editor.draft" },
  { value: "published", label: "admin.editor.published" },
  { value: "archived", label: "admin.editor.archived" },
];

export const DAY_OPTIONS: Choice<EventDay>[] = [
  { value: "sunday", label: "admin.days.sunday" },
  { value: "monday", label: "admin.days.monday" },
  { value: "tuesday", label: "admin.days.tuesday" },
  { value: "wednesday", label: "admin.days.wednesday" },
  { value: "thursday", label: "admin.days.thursday" },
  { value: "friday", label: "admin.days.friday" },
  { value: "saturday", label: "admin.days.saturday" },
];

export const KIND_OPTIONS: Choice<EventKind>[] = [
  { value: "once", label: "admin.event.once" },
  { value: "weekly", label: "admin.event.weekly" },
];
