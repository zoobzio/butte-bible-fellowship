import type { Appearance } from "@bbf/schema/types";

import { toAppearance } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useAppearance = () => {
  const db = useDatabase();

  /**
   * How the site looks over what its theme says: the overrides of the
   * theme's tokens and the modifiers a visitor starts with, as they were
   * stored. Nothing over the theme when the table holds no row.
   */
  const fetch = async (): Promise<Appearance> => {
    const row = await db.web.appearance.fetch.first();
    return row === null ? { patch: {}, input: {} } : toAppearance(row);
  };

  return { fetch };
};
