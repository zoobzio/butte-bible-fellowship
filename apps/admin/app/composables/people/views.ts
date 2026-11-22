import type { PeopleView } from "@bbf/schema/types";

import { peopleView } from "@bbf/schema";
import { createViews } from "#imports";
import { useViewStorage } from "~/composables/views";
import { PEOPLE_VIEWS } from "~/constants/people";

/**
 * The saved views of the people table: the one the admin starts with, and
 * beside it the ones whoever is signed in has saved, kept by the admin's
 * API. Each is read through the schema the API checks a save against, so
 * one saved before the people's columns changed is set aside, not applied.
 * Called with the people table, which it reads the arrangement from and
 * puts a view's back into.
 */
export const usePeopleViews = createViews<PeopleView>("people", {
  schema: peopleView,
  views: PEOPLE_VIEWS,
  ...useViewStorage<PeopleView>("people"),
});
