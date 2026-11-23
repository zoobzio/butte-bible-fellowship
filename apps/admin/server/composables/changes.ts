import { useDatabase } from "#layers/bbf/server/composables/database";

/** The admin's lists the database keeps a count of the writes of. */
export type ChangeSurface = "people" | "content";

/**
 * What the admin's lists have been through, as the database counts it: one
 * more with every write to what a list shows, an addition, a change or a
 * removal alike.
 */
export const useChanges = () => {
  const db = useDatabase();

  /**
   * The mark a list stands at: what a list read now is handed back with,
   * and what it is asked with later, for whether it still stands. Read it
   * before the list itself: a write that lands between the two is then in
   * the list and not in the mark, and costs the next poll a read it did
   * not need, where the other order would lose the write.
   */
  const mark = async (surface: ChangeSurface): Promise<string> =>
    (await db.admin.changes.fetch.first({ surface }))?.version ?? "0";

  return { mark };
};
