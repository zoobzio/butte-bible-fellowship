import type { EventView } from "@bbf/schema/types";

import { eventView } from "@bbf/schema";
import { createViews } from "#imports";
import { useViewStorage } from "~/composables/views";
import { EVENT_VIEWS } from "~/constants/events";

/**
 * The saved views of the events calendar: the one the admin starts with,
 * and beside it the ones whoever is signed in has saved, kept by the
 * admin's API. A view is how much of time the calendar shows at once and
 * its search, and not the day it stands on: one picked is put in place
 * wherever the calendar stands. Each is read through the schema the API
 * checks a save against, so one saved before the events' filters changed
 * is set aside, not applied. Called with the events calendar, which it
 * reads the arrangement from and puts a view's back into.
 */
export const useEventViews = createViews<EventView>("events", {
  schema: eventView,
  views: EVENT_VIEWS,
  ...useViewStorage<EventView>("events"),
});
