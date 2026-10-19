import type { EventRecord } from "@bbf/schema/types";

import { CONTENT_STATUSES, EVENT_DAYS } from "@bbf/schema";
import { defineEntity } from "@zoobzio/foundation/definitions/entity";

/**
 * The events table: an event to a row, the repeating ones first and then
 * the one-offs by date, the title pinned as the way to the editor. A
 * repeating event shows its day; one held once shows its date.
 */
export const EVENTS_TABLE = defineEntity<EventRecord>().defineTable({
  rowKey: "id",
  searchable: false,
  pinnedColumns: ["title"],
  columns: [
    { key: "title", label: "Title" },
    { key: "day", label: "Day", type: "enum", enumValues: [...EVENT_DAYS] },
    { key: "date", label: "Date", type: "date" },
    { key: "start", label: "Start" },
    {
      key: "status",
      label: "Status",
      type: "enum",
      enumValues: [...CONTENT_STATUSES],
    },
    { key: "updatedAt", label: "Updated", type: "datetime" },
  ],
  actions: {
    edit: { label: "Edit" },
  },
});
