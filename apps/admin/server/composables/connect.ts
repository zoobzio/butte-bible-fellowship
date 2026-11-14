import type {
  ConnectArticle,
  ConnectBody,
  ConnectRecord,
} from "@bbf/schema/types";

import { toConnectArguments, toConnectRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

/**
 * The site's connect page, which is one row: read and changed, and neither
 * added nor removed. Each write answers with the page as it then is, or
 * with nothing should its row be missing.
 */
export const useConnect = () => {
  const db = useDatabase();

  const fetch = async (): Promise<ConnectRecord | null> => {
    const row = await db.admin.connect.fetch.first();
    return row === null ? null : toConnectRecord(row);
  };

  /**
   * Its metadata: the title and description it opens with, and how to find
   * and reach the church. Its body stays.
   */
  const update = async (body: ConnectBody): Promise<ConnectRecord | null> => {
    const written = await db.admin.connect.update.first(
      toConnectArguments(body),
    );
    return written === null ? null : fetch();
  };

  /**
   * What is written on it, on its own: the tree, or none when the body
   * leaves it out. Its metadata stays as it is.
   */
  const setBody = async (
    article: ConnectArticle,
  ): Promise<ConnectRecord | null> => {
    const written = await db.admin.connect.body.first({
      body: article.body ?? null,
    });
    return written === null ? null : fetch();
  };

  return { fetch, update, setBody };
};
