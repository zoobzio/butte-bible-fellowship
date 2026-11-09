import type { EventRecord } from "@bbf/schema/types";

import { eventListing } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { ROUTE } from "~/composables/events/routes";
import { useListingFetch } from "~/composables/listing";
import { EVENTS_TABLE, link } from "~/constants/events";

/**
 * The events table: the config of the constants over the admin's API, each
 * row's edit the way to the event's editor. The layer's factory names the
 * columns, the action and the search's text literal from the prose as the
 * table is built in setup, in the visitor's locale.
 */
export const useEventsTable = createTable<EventRecord>("events", {
  ...EVENTS_TABLE,
  fetch: useListingFetch(ROUTE, eventListing),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});
