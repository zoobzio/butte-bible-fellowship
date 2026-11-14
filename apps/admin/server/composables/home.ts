import type { HomeArticle, HomeBody, HomeRecord } from "@bbf/schema/types";

import { toHomeArguments, toHomeRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The site's home page, which is one row: read and changed, and neither
 * added nor removed. Each write answers with the page as it then is, or
 * with nothing should its row be missing.
 */
export const useHome = () => {
  const db = useDatabase();

  const fetch = async (): Promise<HomeRecord | null> => {
    const row = await db.admin.home.fetch.first();
    return row === null ? null : toHomeRecord(row);
  };

  /**
   * Its metadata: what is shown for it, and the words of its hero. Its
   * picture and its body stay.
   */
  const update = async (body: HomeBody): Promise<HomeRecord | null> => {
    const written = await db.admin.home.update.first(toHomeArguments(body));
    return written === null ? null : fetch();
  };

  /**
   * What is written on it, on its own: the tree, or none when the body
   * leaves it out. Its metadata stays as it is.
   */
  const setBody = async (article: HomeArticle): Promise<HomeRecord | null> => {
    const written = await db.admin.home.body.first({
      body: article.body ?? null,
    });
    return written === null ? null : fetch();
  };

  /** The URL of its hero's picture, on its own, or none to leave it without. */
  const setImage = async (image: string | null): Promise<HomeRecord | null> => {
    const written = await db.admin.home.image.first({ image });
    return written === null ? null : fetch();
  };

  return { fetch, update, setBody, setImage };
};
