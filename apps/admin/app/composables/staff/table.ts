import type { StaffRecord } from "@bbf/schema/types";

import { staffListing } from "@bbf/schema";
import { createTable, navigateTo, useNuxtApp } from "#imports";
import { useListingFetch } from "~/composables/listing";
import { ROUTE, link } from "~/composables/staff/routes";
import { FILTER_DAYS } from "~/constants/listing";
import { STAFF_TABLE } from "~/constants/staff";
import { recentDays, toTableDescriptors, withDays } from "~/utils/listing";

export const useStaffTable = () => {
  const { $t } = useNuxtApp();

  const useTable = createTable<StaffRecord>("staff", {
    ...toTableDescriptors(
      withDays(STAFF_TABLE, recentDays(FILTER_DAYS)),
      (message) => $t(message),
    ),
    fetch: useListingFetch(ROUTE, staffListing),
    actions: {
      edit: {
        label: $t.admin.editor.edit(),
        action: (record) => {
          navigateTo(link(record));
        },
      },
    },
  });

  return { table: useTable(), link };
};
