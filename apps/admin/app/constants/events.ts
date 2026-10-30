import type { EventRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES, EVENT_DAYS } from "@bbf/schema";

export const EVENTS_TABLE: TableConfig<EventRecord> = {
  rowKey: "id",
  searchable: false,
  pinnedColumns: ["title"],
  columns: [
    { key: "title", label: "admin.event.title", icon: "text" },
    {
      key: "day",
      label: "admin.event.day",
      icon: "calendar-days",
      type: "enum",
      values: [...EVENT_DAYS],
    },
    { key: "date", label: "admin.event.date", icon: "calendar", type: "date" },
    { key: "start", label: "admin.event.start", icon: "clock" },
    {
      key: "status",
      label: "admin.editor.status",
      icon: "badge",
      type: "enum",
      values: [...CONTENT_STATUSES],
    },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      icon: "calendar-clock",
      type: "datetime",
    },
  ],
};
