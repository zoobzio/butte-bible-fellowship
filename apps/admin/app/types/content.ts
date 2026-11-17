import type { BrowserOptions, UseBrowser } from "#imports";

/**
 * A browser as the app configures it: the descriptors alone. The fetch,
 * the actions and the initial state are wired where the browser is created.
 */
export type BrowserConfig<T> = Omit<
  BrowserOptions<T>,
  "fetch" | "actions" | "folderActions" | "bulkActions" | "initial"
>;

export type BrowserFetch<T> = BrowserOptions<T>["fetch"];

export type BrowserFetchParams = Parameters<BrowserFetch<unknown>>[0];

export type BrowserFetchResult<T> = Awaited<ReturnType<BrowserFetch<T>>>;

/**
 * A folder as the browser lists it: its id as its key, its name as its
 * label, and what it shows under the columns of the files it is listed
 * over, `T`.
 */
export type BrowserFolder<T = unknown> =
  BrowserFetchResult<T>["folders"][number];

/**
 * A step of the browser's trail: a folder that was opened, by its key and
 * its name, with the link its crumb is drawn as.
 */
export type BrowserCrumb = ReturnType<UseBrowser<unknown>>["path"][number];

/**
 * What is being moved: a document or a folder, picked up where it was, to be
 * put down in whichever folder is opened next. `from` is the folder it was
 * picked up in, none for the top.
 */
export interface Held {
  kind: "document" | "folder";
  id: number;
  name: string;
  from?: number;
}

/**
 * What is selected in the browser, by the keys of its rows: the documents
 * and the folders apart, as a folder's key and a document's may be the same.
 */
export interface Selected {
  documents: string[];
  folders: string[];
}

/**
 * What the browser's rows have asked for, which the content page carries
 * out: a folder to rename, a folder to remove, the documents and folders
 * selected to remove together, and what is held to move.
 */
export interface ContentTasks {
  renaming: BrowserFolder | null;
  removing: BrowserFolder | null;
  removingSelected: Selected | null;
  held: Held | null;
}
