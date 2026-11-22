import type { PersonRecord } from "@bbf/schema/types";

import { personListing } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { useListingFetch } from "~/composables/listing";
import { ROUTE } from "~/composables/people/routes";
import { usePeopleRequests } from "~/composables/people/tasks";
import { PEOPLE_TABLE, link } from "~/constants/people";

/**
 * The people table: the config of the constants over the admin's API, each
 * row's edit the way to the person's editor. The rows select, and the
 * removal of the ones selected is left as a request for the people page to
 * carry out. The layer's factory names the columns, the actions and the
 * search's text literal from the prose as the table is built in setup, in
 * the visitor's locale.
 */
export const usePeopleTable = createTable<PersonRecord>("people", {
  ...PEOPLE_TABLE,
  fetch: useListingFetch(ROUTE, personListing),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
  bulkActions: {
    remove: {
      label: "admin.editor.delete",
      action: (selected) => {
        usePeopleRequests().value.removing = selected;
      },
    },
  },
});
