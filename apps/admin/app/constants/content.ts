import type { ContentRecord } from "@bbf/schema/types";

import type { BrowserConfig } from "~/types/content";
import type { RecordLink } from "~/types/listing";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, textual } from "~/constants/listing";

/** The way to a document's editor: the page a row's title leads to. */
export const link: RecordLink<ContentRecord> = (record) =>
  `/content/${record.id}/page`;

/**
 * The content as the admin browses it: folders, each opened in turn from the
 * top, which the trail names after the content itself, and the documents
 * filed in the one that is open. A document shows its title, the way to its
 * editor, its slug and when it was last changed, in the church's time zone.
 * The API sorts by each of them, which the browser's sort menu offers under
 * the column's icon. The search is the open folder's: its free text looks
 * through all that is written of each document there, and names the
 * folders beside them; beside it, the title and the slug filter on the
 * text they hold, carry, start or end with, and the day last changed on
 * before, after or on, or on or after or on or before. The search's text
 * literal is the factory's own, named by the prose.
 */
export const CONTENT_BROWSER: BrowserConfig<ContentRecord> = {
  fileKey: "id",
  timeZone: TIME_ZONE,
  rootLabel: "admin.content.title",
  columns: [
    {
      key: "title",
      label: "admin.page.title",
      icon: "text",
      sortable: true,
      ...textual,
    },
    {
      key: "slug",
      label: "admin.editor.slug",
      icon: "text",
      sortable: true,
      ...textual,
    },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      icon: "calendar-clock",
      type: "datetime",
      sortable: true,
      ...dated,
    },
  ],
};
