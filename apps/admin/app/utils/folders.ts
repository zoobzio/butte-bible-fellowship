import type { FolderRecord } from "@bbf/schema/types";

import type { BrowserFetchParams, BrowserFolder } from "~/types/content";

import { toFilterQuery } from "~/utils/listing";

/** A folder as the browser lists it: named by its id, with what it holds. */
export const toBrowserFolder = (record: FolderRecord): BrowserFolder => ({
  key: String(record.id),
  label: record.name,
  count: record.count,
});

/** The id of a folder the browser lists, read back from its key. */
export const folderId = (folder: Pick<BrowserFolder, "key">): number =>
  Number(folder.key);

/**
 * The folder a trail of keys ends in, by its id: the one that is open.
 * None at the top, where the trail is empty.
 */
export const folderOf = (path: readonly string[]): number | undefined => {
  const key = path.at(-1);
  return key === undefined ? undefined : Number(key);
};

/**
 * The folders inside the open one, as the API is asked for them: all of
 * them, or the ones the free text names. A folder has its name alone to be
 * found by, so the column filters, which are the documents', narrow none.
 */
export const toFoldersQuery = (
  params: Pick<BrowserFetchParams, "path" | "query">,
): Record<string, number | string> => {
  const parent = folderOf(params.path);
  return {
    ...(parent === undefined ? {} : { parent }),
    ...(params.query === "" ? {} : { q: params.query }),
  };
};

/**
 * The documents filed in the open folder, as the API is asked for them: the
 * folder, the free text as `q`, one column filter per key, and the sort
 * when the browser holds one. The search is the open folder's alone: it
 * reaches into none of the folders inside it.
 */
export const toContentQuery = (
  params: BrowserFetchParams,
): Record<string, number | string> => {
  const folder = folderOf(params.path);
  return {
    ...toFilterQuery(params.filters),
    ...(folder === undefined ? {} : { folder }),
    ...(params.query === "" ? {} : { q: params.query }),
    ...(params.sortField === null
      ? {}
      : { sort: params.sortField, direction: params.sortDirection }),
  };
};
