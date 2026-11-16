import type { FolderRecord } from "@bbf/schema/types";

import type { BrowserFetchParams, BrowserFolder } from "~/types/content";

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

/** The folders inside the open one, as the API is asked for them. */
export const toFoldersQuery = (
  params: Pick<BrowserFetchParams, "path">,
): Record<string, number> => {
  const parent = folderOf(params.path);
  return parent === undefined ? {} : { parent };
};

/**
 * The documents filed in the open folder, as the API is asked for them: the
 * folder, and the sort when the browser holds one. What the browser's
 * search commits is asked for by nothing: the API does not search a folder.
 */
export const toContentQuery = (
  params: Pick<BrowserFetchParams, "path" | "sortField" | "sortDirection">,
): Record<string, number | string> => {
  const folder = folderOf(params.path);
  return {
    ...(folder === undefined ? {} : { folder }),
    ...(params.sortField === null
      ? {}
      : { sort: params.sortField, direction: params.sortDirection }),
  };
};
