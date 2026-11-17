import type { ContentRecord, ContentView, FolderSort } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { BrowserConfig } from "~/types/content";
import type { RecordLink } from "~/types/listing";

import { contentView } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, textual } from "~/constants/listing";

/** The way to a document's editor: the page a row's title leads to. */
export const link: RecordLink<ContentRecord> = (record) =>
  `/content/${record.id}/page`;

/**
 * The content as the admin browses it: folders, each opened in turn from the
 * top, which the trail names after the content itself, and the documents
 * filed in the one that is open. A document shows its title, the way to its
 * editor, its slug, its media type, which is what kind of document it is, how much it holds and when
 * it was last changed, in the church's time zone. A folder shows, under the
 * last two, what all that is under it comes to.
 * The API sorts by each of them, which the browser's sort menu offers under
 * the column's icon. The search is the open folder's: its free text looks
 * through all that is written of each document there, and names the
 * folders beside them; beside it, the title and the slug filter on the
 * text they hold, carry, start or end with, the media type the same way,
 * so `image/` started with is every image, and the day last changed on before, after or on, or on or after or on or
 * before. The size filters on nothing. The search's text
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
      key: "mime",
      label: "admin.content.type",
      icon: "shapes",
      sortable: true,
      ...textual,
    },
    {
      key: "size",
      label: "admin.content.size",
      icon: "hard-drive",
      type: "filesize",
      align: "right",
      sortable: true,
      filterable: false,
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

/**
 * What the folders are sorted by under each column the documents sort by:
 * their name under the title, and what they show under a column of their
 * own. Under any other, a folder has nothing to be sorted by, and the
 * folders stay in their own order, by name.
 */
export const FOLDER_SORTS: Partial<Record<string, FolderSort>> = {
  title: "name",
  size: "size",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

/**
 * The views of the content the admin itself has, before any a user saves:
 * the browser as it starts, nothing sorted and nothing searched for, which
 * is what its tab goes back to. Its payload is the schema's own defaults,
 * as the browser starts from none of its own. Its name is a message of the
 * prose, which the tabs resolve.
 */
export const CONTENT_VIEWS: {
  id: string;
  name: Extract<AppProsaryMessage, string>;
  payload: ContentView;
}[] = [
  {
    id: "all",
    name: "admin.content.allView",
    payload: contentView.parse({}),
  },
];
