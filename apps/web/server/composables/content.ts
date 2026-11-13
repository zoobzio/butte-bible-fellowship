import type { ContentDocument } from "@bbf/utils";

import { toContentDocument } from "@bbf/utils";

import { useDatabase } from "#layers/bbf/server/composables/database";

export const useContent = () => {
  const db = useDatabase();

  /** The slug of every page the site holds. */
  const list = async (): Promise<string[]> => {
    const rows = await db.web.content.list();
    return rows.map((row) => row.slug);
  };

  /** A page as a content document: its front matter over what is written. */
  const fetch = async (slug: string): Promise<ContentDocument | null> => {
    const row = await db.web.content.fetch.first({ slug });
    return row === null ? null : toContentDocument(row);
  };

  return { list, fetch };
};
