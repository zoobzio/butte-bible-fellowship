import type { EventForm, StaffRole } from "@bbf/schema/types";

import type { Choice } from "~/types/editor";

export const ROLE_OPTIONS: Choice<StaffRole>[] = [
  { value: "pastor", label: "roles.pastor" },
  { value: "elder", label: "roles.elder" },
  { value: "staff", label: "roles.staff" },
];

/** The weeks of the month, each as the form's select writes it. */
export const WEEK_OPTIONS: Choice<NonNullable<EventForm["weeks"]>[number]>[] = [
  { value: "1", label: "admin.weeks.first" },
  { value: "2", label: "admin.weeks.second" },
  { value: "3", label: "admin.weeks.third" },
  { value: "4", label: "admin.weeks.fourth" },
  { value: "5", label: "admin.weeks.fifth" },
];
