import type { ConnectPage } from "@bbf/schema/types";
import type { ContentDocument } from "@bbf/utils";

import { toConnectDocument } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useConnect = () => {
  const db = useDatabase();

  /** The connect page as a content document: how to reach the church in its front matter. */
  const fetch = async (): Promise<ContentDocument<ConnectPage> | null> => {
    const row = await db.web.connect.fetch.first();
    return row === null ? null : toConnectDocument(row);
  };

  return { fetch };
};
