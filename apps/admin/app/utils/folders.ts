import type {
  ContentRecord,
  ContentResource,
  FolderRecord,
} from "@bbf/schema/types";

import type {
  BrowserCrumb,
  BrowserFetchParams,
  BrowserFetchResult,
  BrowserFolder,
} from "~/types/content";

import { browse } from "~/constants/content";
import { toFilterQuery } from "~/utils/listing";

/**
 * The path an address names, of what its route holds after the content's
 * own page: the steps in order, as the router decoded them. None at the
 * top, where it holds nothing.
 */
export const toPath = (param: unknown): string[] => {
  const steps = Array.isArray(param) ? param : [param];
  return steps.filter(
    (step): step is string => typeof step === "string" && step !== "",
  );
};

/** Whether two paths are one: the same steps, in the same order. */
export const samePath = (
  one: readonly string[],
  other: readonly string[],
): boolean =>
  one.length === other.length &&
  one.every((step, index) => step === other[index]);

/** Whether a path is another, or is somewhere under it. */
export const isUnder = (
  path: readonly string[],
  above: readonly string[],
): boolean => samePath(path.slice(0, above.length), above);

/** The folder a path's last step is in: the path above it. */
export const parentOf = (path: readonly string[]): string[] =>
  path.slice(0, -1);

/**
 * A folder as the browser lists it, in the folder at `path`: named by its
 * name, which is its step of the path, with how many folders and documents
 * it holds itself, and under the documents' columns what all that is under
 * it comes to: how much it holds, and when the last of it was changed. Its
 * link is its own page, where it is browsed.
 */
export const toBrowserFolder = (
  record: FolderRecord,
  path: readonly string[],
): BrowserFolder<ContentRecord> => ({
  key: record.name,
  label: record.name,
  count: record.count,
  values: { size: record.size, updatedAt: record.updatedAt },
  link: { to: browse([...path, record.name]) },
});

/**
 * The trail of a path: a crumb to each folder on the way down, named by
 * its step, which is the folder's name, and linked to its own page. It is
 * read off the path alone, with nothing asked of the API.
 */
export const toCrumbs = (path: readonly string[]): BrowserCrumb[] =>
  path.map((step, index) => ({
    key: step,
    label: step,
    link: { to: browse(path.slice(0, index + 1)) },
  }));

/**
 * What the browser lists of what a path names: a folder's folders and its
 * documents, and of a document, which holds neither, nothing.
 */
export const toListing = (
  resource: ContentResource,
  path: readonly string[],
): BrowserFetchResult<ContentRecord> =>
  resource.kind === "folder"
    ? {
        folders: resource.folders.map((folder) =>
          toBrowserFolder(folder, path),
        ),
        files: resource.files,
      }
    : { folders: [], files: [] };

/**
 * What a folder is asked for, beside its path: the free text as `q`, one
 * column filter per key, and the sort when the browser holds one. The
 * search is the open folder's alone: it reaches into none of the folders
 * inside it.
 */
export const toContentQuery = (
  params: Omit<BrowserFetchParams, "path">,
): Record<string, number | string> => ({
  ...toFilterQuery(params.filters),
  ...(params.query === "" ? {} : { q: params.query }),
  ...(params.sortField === null
    ? {}
    : { sort: params.sortField, direction: params.sortDirection }),
});
