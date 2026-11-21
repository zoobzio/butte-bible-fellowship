import type { ContentRecord, ContentView } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { BrowserConfig } from "~/types/content";

import { contentView } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, textual } from "~/constants/listing";

/** The page the content is browsed on, at its top. */
export const CONTENT = "/content";

/**
 * Where something of the content is, as an address: its path under the
 * content's own page, each name encoded as a step of it. It is the page of
 * a folder, which browses it, and of a document, which edits it; the top
 * is the path of no steps. It is what a folder's row and a crumb of the
 * trail link to.
 */
export const browse = (path: readonly string[] = []): string =>
  [CONTENT, ...path.map((step) => encodeURIComponent(step))].join("/");

/**
 * The content as the admin browses it: folders, each opened in turn from the
 * top, which the trail names after the content itself and links to the page, and the documents
 * filed in the one that is open. A document is named by its slug, the last
 * step of its path. It shows its title, the way to its
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
  fileKey: "slug",
  timeZone: TIME_ZONE,
  rootLabel: "admin.content.title",
  rootLink: { to: browse() },
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
