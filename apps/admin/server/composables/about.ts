import type { AboutArticle, AboutBody, AboutRecord } from "@bbf/schema/types";

import { toAboutArguments, toAboutRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The site's About Us page, which is one row: read and changed, and
 * neither added nor removed. Each write answers with the page as it then
 * is, or with nothing should its row be missing.
 */
export const useAbout = () => {
  const db = useDatabase();

  const fetch = async (): Promise<AboutRecord | null> => {
    const row = await db.admin.about.fetch.first();
    return row === null ? null : toAboutRecord(row);
  };

  /** Its metadata: the title and description it opens with. Its body stays. */
  const update = async (body: AboutBody): Promise<AboutRecord | null> => {
    const written = await db.admin.about.update.first(toAboutArguments(body));
    return written === null ? null : fetch();
  };

  /**
   * What is written on it, on its own: the tree, or none when the body
   * leaves it out. Its metadata stays as it is.
   */
  const setBody = async (
    article: AboutArticle,
  ): Promise<AboutRecord | null> => {
    const written = await db.admin.about.body.first({
      body: article.body ?? null,
    });
    return written === null ? null : fetch();
  };

  return { fetch, update, setBody };
};
