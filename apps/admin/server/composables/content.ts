import type {
  ContentArticle,
  ContentBody,
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
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { CONTENT_REFUSALS } from "~~/server/constants/folders";
import { orRefused } from "~~/server/utils/conflicts";
import { toDaySearch, toTextSearch } from "~~/server/utils/listing";

/**
 * What a write of a page comes to when it is not the page written: `taken`,
 * its slug is another page's, or a folder's beside it; `gone`, the folder
 * it was to be filed in is not there.
 */
export type ContentRefusal =
  (typeof CONTENT_REFUSALS)[keyof typeof CONTENT_REFUSALS];

/** The text columns of a page, each filtered by the text operators. */
const TEXT_COLUMNS = ["title", "slug", "mime"] as const;

/** The day columns of a page, by the name the list query gives each. */
const DAY_COLUMNS = { updated: "updatedAt" } as const;

/**
 * The search as the list query takes it: null for each part left out, and
 * the church's time zone, which decides what day a page was changed on.
 */
const toSearch = (query: ContentQuery) => ({
  q: query.q === undefined || query.q === "" ? null : query.q,
  ...toTextSearch(TEXT_COLUMNS, query),
  tz: TIME_ZONE,
  ...toDaySearch(DAY_COLUMNS, query),
});

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<ContentSort, string> = {
  title: "title",
  slug: "slug",
  mime: "mime",
  size: "size",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, null: a search then lists the
 * nearest first, and otherwise the admin's order holds, the pages by their
 * title, which the query falls back to after any sort.
 */
const toOrder = (query: ContentQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
  direction: query.direction ?? "asc",
});

export const useContent = () => {
  const db = useDatabase();

  /**
   * The pages filed in one folder, or at the top when none is named, which
   * the query's search leaves: the folder alone is searched, and none
   * inside it.
   */
  const list = async (
    folder: number | undefined,
    query: ContentQuery,
  ): Promise<ContentRecords> => {
    const rows = await db.admin.content.list({
      folder_id: folder ?? null,
      ...toSearch(query),
      ...toOrder(query),
    });
    return rows.map(toContentRecord);
  };

  const fetch = async (id: number): Promise<ContentRecord | null> => {
    const row = await db.admin.content.fetch.first({ id });
    return row === null ? null : toContentRecord(row);
  };

  /**
   * A new page, in the folder named, or at the top: refused when its slug
   * is taken, or that folder is gone.
   */
  const create = (
    body: ContentBody,
    folder?: number,
  ): Promise<ContentRecord | ContentRefusal | null> =>
    orRefused(CONTENT_REFUSALS, async () => {
      const written = await db.admin.content.create.first(
        toContentDraftArguments(body, folder),
      );
      return written === null ? null : fetch(written.id);
    });

  /** A page's metadata, replaced: refused when the slug it takes is taken. */
  const update = (
    id: number,
    body: ContentBody,
  ): Promise<ContentRecord | ContentRefusal | null> =>
    orRefused(CONTENT_REFUSALS, async () => {
      const written = await db.admin.content.update.first({
        ...toContentArguments(body),
        id,
      });
      return written === null ? null : fetch(id);
    });

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
   * Where a page is filed, on its own: the folder, or the top when none is
   * named. Nothing else of the page changes. It is refused when that
   * folder is gone, or holds a folder of the page's name.
   */
  const setFolder = (
    id: number,
    folder?: number,
  ): Promise<ContentRecord | ContentRefusal | null> =>
    orRefused(CONTENT_REFUSALS, async () => {
      const written = await db.admin.content.folder.first({
        id,
        folder_id: folder ?? null,
      });
      return written === null ? null : fetch(id);
    });

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.content.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setBody, setFolder, remove };
};
