import type { ContentRecord } from "@bbf/schema/types";

import { contentListing } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { ROUTE } from "~/composables/content/routes";
import { useListingFetch } from "~/composables/listing";
import { CONTENT_TABLE, link } from "~/constants/content";

/**
 * The content table: the config of the constants over the admin's API, each
 * row's edit the way to the page's editor. The layer's factory names the
 * columns, the action and the search's text literal from the prose as the
 * table is built in setup, in the visitor's locale.
 */
export const useContentTable = createTable<ContentRecord>("content", {
  ...CONTENT_TABLE,
  fetch: useListingFetch(ROUTE, contentListing),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});
