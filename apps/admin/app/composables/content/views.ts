import type { ContentView } from "@bbf/schema/types";

import { contentView } from "@bbf/schema";
import { createViews } from "#imports";
import { useViewStorage } from "~/composables/views";
import { CONTENT_VIEWS } from "~/constants/content";

/**
 * The saved views of the content browser: the one the admin starts with,
 * and beside it the ones whoever is signed in has saved, kept by the
 * admin's API. A view is the browser's sort and its search, and not the
 * folder that is open: one picked is put in place wherever the browser
 * stands. Each is read through the schema the API checks a save against,
 * so one saved before the content's columns changed is set aside, not
 * applied. Called with the content browser, which it reads the arrangement
 * from and puts a view's back into.
 */
export const useContentViews = createViews<ContentView>("content", {
  schema: contentView,
  views: CONTENT_VIEWS,
  ...useViewStorage<ContentView>("content"),
});
