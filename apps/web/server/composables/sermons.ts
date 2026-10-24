import type { Sermon } from "@bbf/schema/types";

import { toSermon } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The sermons the site lists: the published ones, as the database holds
 * them, each in the shape the API serves. `list` is the newest, as many as
 * asked; `fetch` is one sermon by slug, with what is written about it, or
 * `null` when no published sermon has it.
 */
export const useSermons = () => {
  const db = useDatabase();

  const list = async (limit: number): Promise<Sermon[]> => {
    const rows = await db.web.sermons.list({ limit });
    return rows.map(toSermon);
  };

  const fetch = async (slug: string): Promise<Sermon | null> => {
    const row = await db.web.sermons.fetch.first({ slug });
    return row === null ? null : toSermon(row);
  };

  return { list, fetch };
};
