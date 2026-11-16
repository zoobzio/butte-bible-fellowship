import type {
  ViewBody,
  ViewPath,
  ViewRecord,
  ViewRecords,
  ViewSurface,
} from "@bbf/schema/types";

import { toViewArguments, toViewRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The saved views of the admin's lists, each a user's own: every call
 * names whose by `sub`, as their session names them, and reaches no one
 * else's.
 */
export const useViews = () => {
  const db = useDatabase();

  /** A user's views of one list, in the order they were saved. */
  const list = async (
    sub: string,
    surface: ViewSurface,
  ): Promise<ViewRecords> => {
    const rows = await db.admin.views.list({ sub, surface });
    return rows.map(toViewRecord);
  };

  /**
   * A view saved under the id its address names: a new one written, or
   * the user's own of that list given its new name and payload. Nothing
   * when the id is a view of another user's or of another list, which is
   * left as it is. The payload is the body's, as its list's schema left
   * it: the database holds it to no shape.
   */
  const save = async (
    sub: string,
    path: ViewPath,
    body: ViewBody,
  ): Promise<ViewRecord | null> => {
    const row = await db.admin.views.save.first(
      toViewArguments(sub, path, body),
    );
    return row === null ? null : toViewRecord(row);
  };

  /** Removes a user's own view of a list. */
  const remove = async (sub: string, path: ViewPath): Promise<boolean> => {
    const deleted = await db.admin.views.delete({
      sub,
      surface: path.surface,
      id: path.id,
    });
    return deleted > 0;
  };

  return { list, save, remove };
};
