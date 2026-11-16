import type { ViewSurface } from "@bbf/schema/types";
import type { ViewsOptions } from "#imports";

import { viewRecords } from "@bbf/schema";
import { useRequest } from "#imports";
import { useApi } from "~/composables/api";

/** The admin's API for the saved views, each list's under its own name. */
export const ROUTE = "/api/views";

/**
 * Where the views of one of the admin's lists are kept, over the admin's
 * API: what `createViews` loads them from, saves one to and removes one
 * from. They are the signed-in user's own, which the API sees to. A save
 * is one write, of a new view or of one changed or renamed: the view goes
 * under the id it was made with, its payload checked by the API against
 * the list's schema. What is loaded comes back as it was stored, for the
 * views to read through that schema themselves, and set aside what it no
 * longer accepts.
 */
export const useViewStorage = <P>(
  surface: ViewSurface,
): Required<Pick<ViewsOptions<P>, "load" | "save" | "remove">> => {
  const api = useApi();
  const route = `${ROUTE}/${surface}`;

  return {
    load: async () => viewRecords.parse(await api(route)),
    save: async (view) => {
      await api(`${route}/${view.id}`, {
        method: "PUT",
        body: { name: view.name, payload: view.payload },
      });
    },
    remove: async (view) => {
      await api(`${route}/${view.id}`, { method: "DELETE" });
    },
  };
};

/**
 * Loads the saved views for the page they sit on, before the list under
 * them is: they load once, and put the open one in place, so the list's
 * first fetch reads it. A later visit finds them as they were left.
 */
export const useViewsRequest = (views: {
  id: string;
  init(): Promise<boolean>;
}) =>
  useRequest(`views:${views.id}`, async () => {
    await views.init();
    return true;
  });
