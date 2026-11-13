import type { ContentRecord } from "@bbf/schema/types";

import type { RecordLink, TableConfig } from "~/types/listing";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, optional, textual } from "~/constants/listing";

/** The way to a page's editor: the page a row's title leads to. */
export const link: RecordLink<ContentRecord> = (record) =>
  `/content/${record.id}/page`;

/**
 * The site's pages as the admin lists them: every column of a page's
 * record a cell can show, what is written on it aside. The
 * title, the way to the page's editor, the slug, the description and the
 * day it was last changed are shown at first; the day it was added waits
 * in the column manager. A column the API sorts by is sortable. The free
 * text searches the title, the slug, the description and what is written
 * on the page; beside it, each text column
 * filters on the text it holds, carries, starts or ends with, the optional
 * one on whether it is filled in too, and the days on before, after or on,
 * or on or after or on or before. The search's text literal is the
 * factory's own, named by the prose; every cell formats in the church's
 * time zone.
 */
export const CONTENT_TABLE: TableConfig<ContentRecord> = {
  rowKey: "id",
  timeZone: TIME_ZONE,
  searchable: true,
  pinnedColumns: ["title"],
  defaultColumnOrder: ["title", "slug", "description", "updatedAt"],
  columns: [
    {
      key: "title",
      label: "admin.page.title",
      icon: "text",
      link,
      ...textual,
      sortable: true,
    },
    {
      key: "slug",
      label: "admin.editor.slug",
      icon: "text",
      ...textual,
      sortable: true,
    },
    {
      key: "description",
      label: "admin.page.description",
      icon: "text",
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
