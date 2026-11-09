import type { EventRecord } from "@bbf/schema/types";

import type { RecordLink, TableConfig } from "~/types/listing";

import { EVENT_DAYS } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, matching, optional, textual } from "~/constants/listing";

/** The way to an event's details: the page a row's title leads to. */
export const link: RecordLink<EventRecord> = (record) =>
  `/events/${record.id}/details`;

/**
 * The events as the admin lists them: every column of an event's record a
 * cell can show, what is written about it aside. The title, the way to the
 * event's editor, the day and the date it is held, whether it recurs and
 * when it starts are shown at first; the rest wait in the column manager.
 * A column the API sorts by is sortable. The free text searches the title,
 * the slug, the summary and what is written about the event; beside it,
 * each text column filters on the text it holds, carries, starts or ends
 * with, an optional one on whether it is filled in too, the day and
 * whether it recurs on a value held or not, and the date and the days on
 * before, after or on, or on or after or on or before; the times are
 * sorted by and filtered by nothing. The search's text literal is the
 * factory's own, named by the prose; every cell formats in the church's
 * time zone.
 */
export const EVENTS_TABLE: TableConfig<EventRecord> = {
  rowKey: "id",
  timeZone: TIME_ZONE,
  searchable: true,
  pinnedColumns: ["title"],
  defaultColumnOrder: [
    "title",
    "day",
    "date",
    "recurring",
    "start",
    "updatedAt",
  ],
  columns: [
    {
      key: "title",
      label: "admin.event.title",
      icon: "text",
      link,
      ...textual,
      sortable: true,
    },
    {
      key: "day",
      label: "admin.event.day",
      icon: "calendar-days",
      type: "enum",
      values: [...EVENT_DAYS],
      ...matching,
      sortable: true,
    },
    {
      key: "date",
      label: "admin.event.date",
      icon: "calendar",
      type: "date",
      ...dated,
      sortable: true,
    },
    {
      key: "recurring",
      label: "admin.event.recurring",
      icon: "calendar-clock",
      type: "boolean",
      values: ["true", "false"],
      ...matching,
      sortable: true,
    },
    {
      key: "start",
      label: "admin.event.start",
      icon: "clock",
      filterable: false,
      sortable: true,
    },
    {
      key: "end",
      label: "admin.event.end",
      icon: "clock",
      filterable: false,
    },
    {
      key: "slug",
      label: "admin.editor.slug",
      icon: "text",
      ...textual,
      sortable: true,
    },
    {
      key: "summary",
      label: "admin.editor.summary",
      icon: "text",
      ...optional,
    },
    {
      key: "image",
      label: "admin.event.image",
      icon: "image",
      type: "url",
      ...optional,
    },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      icon: "calendar-clock",
      type: "datetime",
      ...dated,
      sortable: true,
    },
    {
      key: "createdAt",
      label: "admin.editor.created",
      icon: "calendar",
      type: "datetime",
      ...dated,
      sortable: true,
    },
  ],
};
