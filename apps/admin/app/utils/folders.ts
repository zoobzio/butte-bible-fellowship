import type { ContentRecord, FolderRecord } from "@bbf/schema/types";

import type {
  BrowserCrumb,
  BrowserFetchParams,
  BrowserFolder,
} from "~/types/content";

import { FOLDER_SORTS, browse } from "~/constants/content";
import { toFilterQuery } from "~/utils/listing";

/**
 * A folder as the browser lists it: named by its id, with how many
 * folders and documents it holds itself, and under the documents' columns
 * what all that is under it comes to: how much it holds, and when the last
 * of it was changed. Its link is where it is browsed, which its crumb
 * carries once it is opened.
 */
export const toBrowserFolder = (
  record: FolderRecord,
): BrowserFolder<ContentRecord> => ({
  key: String(record.id),
  label: record.name,
  count: record.count,
  values: { size: record.size, updatedAt: record.updatedAt },
  link: { to: browse(record.id) },
});

/**
 * A folder as the trail names it: what the browser keeps of one it has
 * opened.
 */
export const toCrumb = (record: FolderRecord): BrowserCrumb => {
  const { key, label, link } = toBrowserFolder(record);
  return { key, label, link };
};

/**
 * The folder an address asks for under its `folder`, by its id. None where
 * it names none, or what it names is no id.
 */
export const folderParam = (value: unknown): number | undefined => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

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
 * The sort reaches them where a folder has something to be sorted by under
 * the column: its name under the title, and its own size and dates.
 */
export const toFoldersQuery = (
  params: Pick<
    BrowserFetchParams,
    "path" | "query" | "sortField" | "sortDirection"
  >,
): Record<string, number | string> => {
  const parent = folderOf(params.path);
  const sort =
    params.sortField === null ? undefined : FOLDER_SORTS[params.sortField];
  return {
    ...(parent === undefined ? {} : { parent }),
    ...(params.query === "" ? {} : { q: params.query }),
    ...(sort === undefined ? {} : { sort, direction: params.sortDirection }),
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
