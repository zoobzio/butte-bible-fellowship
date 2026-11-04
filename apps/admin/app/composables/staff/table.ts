import type { StaffRecord } from "@bbf/schema/types";

import { staffListing } from "@bbf/schema";
import { createTable, navigateTo } from "#imports";
import { useListingFetch } from "~/composables/listing";
import { ROUTE } from "~/composables/staff/routes";
import { STAFF_TABLE, link } from "~/constants/staff";

/**
 * The staff table: the config of the constants over the admin's API, each
 * row's edit the way to the member's editor. The layer's factory names the
 * columns, the action and the search's text literal from the prose as the
 * table is built in setup, in the visitor's locale.
 */
export const useStaffTable = createTable<StaffRecord>("staff", {
  ...STAFF_TABLE,
  fetch: useListingFetch(ROUTE, staffListing),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
  },
});
