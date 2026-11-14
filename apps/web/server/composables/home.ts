import type { HomePage } from "@bbf/schema/types";
import type { ContentDocument } from "@bbf/utils";

import { toHomeDocument } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useHome = () => {
  const db = useDatabase();

  /** The home page as a content document: its hero in its front matter. */
  const fetch = async (): Promise<ContentDocument<HomePage> | null> => {
    const row = await db.web.home.fetch.first();
    return row === null ? null : toHomeDocument(row);
  };

  return { fetch };
};
