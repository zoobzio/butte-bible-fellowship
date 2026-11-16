import type { EventRecord } from "@bbf/schema/types";

import type { RecordLink, TableConfig } from "~/types/listing";

import { EVENT_DAYS } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import {
  PAGE_SIZE,
  dated,
  matching,
  optional,
  textual,
} from "~/constants/listing";

/** The way to an event's details: the page a row's title leads to. */
export const link: RecordLink<EventRecord> = (record) =>
  `/events/${record.id}/details`;

/**
 * The events as the admin lists them: every column of an event's record a
 * cell can show, what is written about it aside. The title, the way to the
 * event's editor, the day and the date it is held, whether it recurs and
 * when it starts are shown at first; the rest wait in the column manager,
 * and the title is never hidden. A column sorts unless the API does not
 * sort by it, and by one column at a time, as the API does. The free text
 * searches the title, the slug, the summary and what is written about the
 * event; beside it,
 * each text column filters on the text it holds, carries, starts or ends
 * with, an optional one on whether it is filled in too, the day and
 * whether it recurs on a value held or not, and the date and the days on
 * before, after or on, or on or after or on or before; the times are
 * sorted by and filtered by nothing. The search's text literal is the
 * factory's own, named by the prose; every cell formats in the church's
 * time zone.
 */
export const EVENTS_TABLE: TableConfig<EventRecord> = {
  getRowId: (record) => String(record.id),
  timeZone: TIME_ZONE,
  permissions: { multiSort: false },
  initialState: {
    pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    columnVisibility: {
      end: false,
      slug: false,
      summary: false,
      image: false,
      createdAt: false,
    },
  },
  columns: [
    {
      accessorKey: "title",
      size: 240,
      enableHiding: false,
      meta: {
        label: "admin.event.title",
        icon: "text",
        link,
        ...textual,
      },
    },
    {
      accessorKey: "day",
      meta: {
        label: "admin.event.day",
        icon: "calendar-days",
        type: "enum",
        values: [...EVENT_DAYS],
        ...matching,
      },
    },
    {
      accessorKey: "date",
      meta: {
        label: "admin.event.date",
        icon: "calendar",
        type: "date",
        ...dated,
      },
    },
    {
      accessorKey: "recurring",
      meta: {
        label: "admin.event.recurring",
        icon: "calendar-clock",
        type: "boolean",
        values: ["true", "false"],
        ...matching,
      },
    },
    {
      accessorKey: "start",
      meta: {
        label: "admin.event.start",
        icon: "clock",
        filterable: false,
      },
    },
    {
      accessorKey: "end",
      enableSorting: false,
      meta: {
        label: "admin.event.end",
        icon: "clock",
        filterable: false,
      },
    },
    {
      accessorKey: "slug",
      meta: {
        label: "admin.editor.slug",
        icon: "text",
        ...textual,
      },
    },
    {
      accessorKey: "summary",
      enableSorting: false,
      meta: {
        label: "admin.editor.summary",
        icon: "text",
        ...optional,
      },
    },
    {
      accessorKey: "image",
      enableSorting: false,
      meta: {
        label: "admin.event.image",
        icon: "image",
        type: "url",
        ...optional,
      },
    },
    {
      accessorKey: "updatedAt",
      size: 200,
      meta: {
        label: "admin.editor.updated",
        icon: "calendar-clock",
        type: "datetime",
        ...dated,
      },
    },
    {
      accessorKey: "createdAt",
      size: 200,
      meta: {
        label: "admin.editor.created",
        icon: "calendar",
        type: "datetime",
        ...dated,
      },
    },
  ],
};
