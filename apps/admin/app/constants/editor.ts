import type { ContentStatus, EventDay, StaffRole } from "@bbf/schema/types";

import type { Choice } from "~/types/editor";
import type { EventKind } from "~/types/events";

export const STATUS_OPTIONS: Choice<ContentStatus>[] = [
  { value: "draft", label: "admin.editor.draft" },
  { value: "published", label: "admin.editor.published" },
  { value: "archived", label: "admin.editor.archived" },
];

export const ROLE_OPTIONS: Choice<StaffRole>[] = [
  { value: "pastor", label: "roles.pastor" },
  { value: "elder", label: "roles.elder" },
  { value: "staff", label: "roles.staff" },
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
