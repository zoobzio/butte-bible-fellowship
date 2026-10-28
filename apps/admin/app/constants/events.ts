import type { EventRecord } from "@bbf/schema/types";

import type { TableConfig } from "~/types/listing";

import { CONTENT_STATUSES, EVENT_DAYS } from "@bbf/schema";

/**
 * The events table: an event to a row, the repeating ones first and then
 * the one-offs by date, the title pinned as the way to the editor. A
 * repeating event shows its day; one held once shows its date. Each
 * column is headed by a message of `@bbf/prose`, by key.
 */
export const EVENTS_TABLE: TableConfig<EventRecord> = {
  rowKey: "id",
  searchable: false,
  pinnedColumns: ["title"],
  columns: [
    { key: "title", label: "admin.event.title" },
    {
      key: "day",
      label: "admin.event.day",
      type: "enum",
      enumValues: [...EVENT_DAYS],
    },
    { key: "date", label: "admin.event.date", type: "date" },
    { key: "start", label: "admin.event.start" },
    {
      key: "status",
      label: "admin.editor.status",
      type: "enum",
      enumValues: [...CONTENT_STATUSES],
    },
    { key: "updatedAt", label: "admin.editor.updated", type: "datetime" },
  ],
};
