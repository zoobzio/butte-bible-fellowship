import type { BrowserOptions } from "#imports";

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
 * What the browser's rows have asked for, which the content page carries
 * out: a folder to rename, a folder to remove, and what is held to move.
 */
export interface ContentTasks {
  renaming: BrowserFolder | null;
  removing: BrowserFolder | null;
  held: Held | null;
}
