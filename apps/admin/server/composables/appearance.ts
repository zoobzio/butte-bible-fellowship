import type { AppearanceBody, AppearanceRecord } from "@bbf/schema/types";

import { toAppearanceArguments, toAppearanceRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * How the site looks over what its theme says, which is one row: read and
 * changed, and neither added nor removed. A write answers with what is
 * then set, or with nothing should the row be missing.
 */
export const useAppearance = () => {
  const db = useDatabase();

  const fetch = async (): Promise<AppearanceRecord | null> => {
    const row = await db.admin.appearance.fetch.first();
    return row === null ? null : toAppearanceRecord(row);
  };

  /**
   * The seeds and the modifiers, replaced: what the body leaves out goes
   * back to the theme's own. The patch the site applies is made from the
   * seeds here, and written with them, so the two never part.
   */
  const update = async (
    body: AppearanceBody,
  ): Promise<AppearanceRecord | null> => {
    const written = await db.admin.appearance.update.first(
      toAppearanceArguments(body),
    );
    return written === null ? null : fetch();
  };

  return { fetch, update };
};
