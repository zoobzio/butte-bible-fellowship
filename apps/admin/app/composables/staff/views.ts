import type { StaffView } from "@bbf/schema/types";

import { staffView } from "@bbf/schema";
import { createViews } from "#imports";
import { useViewStorage } from "~/composables/views";
import { STAFF_VIEWS } from "~/constants/staff";

/**
 * The saved views of the staff table: the one the admin starts with, and
 * beside it the ones whoever is signed in has saved, kept by the admin's
 * API. Each is read through the schema the API checks a save against, so
 * one saved before the staff's columns changed is set aside, not applied.
 * Called with the staff table, which it reads the arrangement from and
 * puts a view's back into.
 */
export const useStaffViews = createViews<StaffView>("staff", {
  schema: staffView,
  views: STAFF_VIEWS,
  ...useViewStorage<StaffView>("staff"),
});
