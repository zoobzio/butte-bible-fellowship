import type { EventRecord } from "@bbf/schema/types";

import type { RecordLink, TableConfig } from "~/types/listing";

import { CONTENT_STATUSES, EVENT_DAYS } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

/** The way to an event's editor: the page a row's title leads to. */
export const link: RecordLink<EventRecord> = (record) => `/events/${record.id}`;

/**
 * The events as the admin lists them, the title the way to the event's
 * editor, each cell in the church's time zone; the columns named by the
 * prose where the table is created.
 */
export const EVENTS_TABLE: TableConfig<EventRecord> = {
  rowKey: "id",
  timeZone: TIME_ZONE,
  searchable: false,
  pinnedColumns: ["title"],
  columns: [
    { key: "title", label: "admin.event.title", icon: "text", link },
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
