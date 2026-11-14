import type { ContentDocument } from "@bbf/utils";

import { toAboutDocument } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useAbout = () => {
  const db = useDatabase();

  /** About Us as a content document: its title and description over what is written. */
  const fetch = async (): Promise<ContentDocument | null> => {
    const row = await db.web.about.fetch.first();
    return row === null ? null : toAboutDocument(row);
  };

  return { fetch };
};
