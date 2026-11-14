import type {
  ContentArticle,
  ContentBody,
  ContentDraft,
  ContentPlacement,
  ContentQuery,
  ContentRecord,
  ContentRecords,
  ContentSort,
} from "@bbf/schema/types";

import {
  toContentArguments,
  toContentDraftArguments,
  toContentRecord,
} from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { CONTENT_REFUSALS } from "~~/server/constants/folders";
import { orRefused } from "~~/server/utils/conflicts";

/**
 * What filing a page comes to when it is not the page filed: `gone`, the
 * folder it was to be filed in is not there.
 */
export type ContentRefusal =
  (typeof CONTENT_REFUSALS)[keyof typeof CONTENT_REFUSALS];

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<ContentSort, string> = {
  title: "title",
  slug: "slug",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, null: the admin's order holds,
 * the pages by their title, which the query falls back to after any sort.
 */
const toOrder = (query: ContentQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
  direction: query.direction ?? "asc",
});

export const useContent = () => {
  const db = useDatabase();

  /** The pages filed in one folder, or at the top when the query names none. */
  const list = async (query: ContentQuery): Promise<ContentRecords> => {
    const rows = await db.admin.content.list({
      folder_id: query.folder ?? null,
      ...toOrder(query),
    });
    return rows.map(toContentRecord);
  };

  const fetch = async (id: number): Promise<ContentRecord | null> => {
    const row = await db.admin.content.fetch.first({ id });
    return row === null ? null : toContentRecord(row);
  };

  /**
   * A new page, in the folder its draft names, or at the top: refused when
   * that folder is gone.
   */
  const create = (
    draft: ContentDraft,
  ): Promise<ContentRecord | ContentRefusal | null> =>
    orRefused(CONTENT_REFUSALS, async () => {
      const written = await db.admin.content.create.first(
        toContentDraftArguments(draft),
      );
      return written === null ? null : fetch(written.id);
    });

  const update = async (
    id: number,
    body: ContentBody,
  ): Promise<ContentRecord | null> => {
    const written = await db.admin.content.update.first({
      ...toContentArguments(body),
      id,
    });
    return written === null ? null : fetch(id);
  };

  /**
   * What is written on a page, on its own: the tree, or none when the body
   * leaves it out. Its metadata stays as it is.
   */
  const setBody = async (
    id: number,
    article: ContentArticle,
  ): Promise<ContentRecord | null> => {
    const written = await db.admin.content.body.first({
      id,
      body: article.body ?? null,
    });
    return written === null ? null : fetch(id);
  };

  /**
   * Where a page is filed, on its own: the folder, or the top when the
   * placement names none. Nothing else of the page changes. It is refused
   * when that folder is gone.
   */
  const setFolder = (
    id: number,
    placement: ContentPlacement,
  ): Promise<ContentRecord | ContentRefusal | null> =>
    orRefused(CONTENT_REFUSALS, async () => {
      const written = await db.admin.content.folder.first({
        id,
        folder_id: placement.folder ?? null,
      });
      return written === null ? null : fetch(id);
    });

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.content.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setBody, setFolder, remove };
};
