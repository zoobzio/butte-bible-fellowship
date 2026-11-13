import type {
  ContentArticle,
  ContentBody,
  ContentListing,
  ContentQuery,
  ContentRecord,
  ContentSort,
} from "@bbf/schema/types";

import { toContentArguments, toContentRecord } from "@bbf/utils";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { toDaySearch, toListing, toTextSearch } from "~~/server/utils/listing";

/** The text columns of a page, each filtered by the text operators. */
const TEXT_COLUMNS = ["title", "slug", "description"] as const;

/**
 * The day columns of a page, by the name the list query gives each: the
 * days its row was changed and added.
 */
const DAY_COLUMNS = {
  updated: "updatedAt",
  created: "createdAt",
} as const;

/**
 * The search as the query takes it: null for each part left out, and the
 * church's time zone, which decides what day a page was changed on.
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
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * The order as the list query takes it: the column asked for, ascending
 * unless told otherwise. Asked for nothing, null: a search then lists the
 * nearest first, and otherwise the admin's order holds, the pages by their
 * slug, which the query falls back to after any sort.
 */
const toOrder = (query: ContentQuery) => ({
  sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
  direction: query.direction ?? "asc",
});

export const useContent = () => {
  const db = useDatabase();

  /** One page of the search, and how many pages the whole search holds. */
  const list = (query: ContentQuery): Promise<ContentListing> => {
    const search = { ...toSearch(query), ...toOrder(query) };
    return toListing(
      query,
      (window) => db.admin.content.list({ ...search, ...window }),
      toContentRecord,
    );
  };

  const fetch = async (id: number): Promise<ContentRecord | null> => {
    const row = await db.admin.content.fetch.first({ id });
    return row === null ? null : toContentRecord(row);
  };

  const create = async (body: ContentBody): Promise<ContentRecord | null> => {
    const written = await db.admin.content.create.first(
      toContentArguments(body),
    );
    return written === null ? null : fetch(written.id);
  };

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

  const remove = async (id: number): Promise<boolean> => {
    const deleted = await db.admin.content.delete({ id });
    return deleted > 0;
  };

  return { list, fetch, create, update, setBody, remove };
};
