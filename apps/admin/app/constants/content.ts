import type { ContentRecord } from "@bbf/schema/types";

import type { BrowserConfig } from "~/types/content";
import type { RecordLink } from "~/types/listing";

import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

/** The way to a document's editor: the page a row's title leads to. */
export const link: RecordLink<ContentRecord> = (record) =>
  `/content/${record.id}/page`;

/**
 * The content as the admin browses it: folders, each opened in turn from the
 * top, which the trail names after the content itself, and the documents filed in
 * the one that is open. A document shows its title, the way to its editor, its
 * slug and when it was last changed, in the church's time zone. The API
 * sorts by each of them.
 */
export const CONTENT_BROWSER: BrowserConfig<ContentRecord> = {
  fileKey: "id",
  timeZone: TIME_ZONE,
  rootLabel: "admin.content.title",
  columns: [
    { key: "title", label: "admin.page.title", sortable: true },
    { key: "slug", label: "admin.editor.slug", sortable: true },
    {
      key: "updatedAt",
      label: "admin.editor.updated",
      type: "datetime",
      sortable: true,
    },
  ],
};
