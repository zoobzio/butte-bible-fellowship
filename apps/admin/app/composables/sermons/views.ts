import type { SermonView } from "@bbf/schema/types";

import { sermonView } from "@bbf/schema";
import { createViews } from "#imports";
import { useViewStorage } from "~/composables/views";
import { SERMON_VIEWS } from "~/constants/sermons";

/**
 * The saved views of the sermons timeline: the one the admin starts
 * with, and beside it the ones whoever is signed in has saved, kept by
 * the admin's API. A view is the timeline's search, and not how far down
 * it was read: one picked is put in place from the latest preached. Each
 * is read through the schema the API checks a save against, so one saved
 * before the sermons' filters changed is set aside, not applied. Called
 * with the sermons timeline, which it reads the arrangement from and puts
 * a view's back into.
 */
export const useSermonViews = createViews<SermonView>("sermons", {
  schema: sermonView,
  views: SERMON_VIEWS,
  ...useViewStorage<SermonView>("sermons"),
});
