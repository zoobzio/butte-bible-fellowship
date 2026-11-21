import type {
  ContentQuery,
  ContentSort,
  FolderBody,
  FolderRecord,
  FolderRecords,
  FolderSort,
} from "@bbf/schema/types";

import { toFolderArguments, toFolderRecord } from "@bbf/utils";
import { useDatabase } from "#layers/bbf/server/composables/database";

import { FOLDER_REFUSALS } from "~~/server/constants/folders";
import { orRefused } from "~~/server/utils/conflicts";

/**
 * What a write of a folder comes to when it is not the folder written:
 * `missing`, no folder has the id; `refused`, the folder is there and the
 * write would break the folders' order, a folder moved under itself or one
 * removed with something still in it.
 */
export type FolderRefusal = "missing" | "refused";

/**
 * What the database refuses a write of a folder over: `taken`, a folder or
 * a page beside it already has the name; `gone`, the folder it was to be
 * inside is not there.
 */
export type FolderConflict =
  (typeof FOLDER_REFUSALS)[keyof typeof FOLDER_REFUSALS];

/**
 * The column of the row each sort key names.
 */
const SORT_COLUMNS: Record<FolderSort, string> = {
  name: "name",
  size: "size",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

/**
 * What the folders are sorted by under each column the pages sort by: their
 * name under the title, and what they show under a column of their own.
 * Under any other, a folder has nothing to be sorted by, and the folders
 * stay in their own order, by name.
 */
const FOLDER_SORTS: Partial<Record<ContentSort, FolderSort>> = {
  title: "name",
  size: "size",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

/** What of a folder's listing its folders are searched and sorted by. */
export type FoldersQuery = Pick<ContentQuery, "q" | "sort" | "direction">;

export const useFolders = () => {
  const db = useDatabase();

  /**
   * The folders inside one, or at the top when none is named: all of them,
   * or the ones the text searched for names, a folder having its name
   * alone to be found by. They follow the sort of the pages they are
   * listed over where a folder has something to be sorted by under its
   * column, ascending unless told otherwise, and are by name otherwise.
   */
  const list = async (
    parent: number | undefined,
    query: FoldersQuery = {},
  ): Promise<FolderRecords> => {
    const sort =
      query.sort === undefined ? undefined : FOLDER_SORTS[query.sort];
    const rows = await db.admin.folders.list({
      parent_id: parent ?? null,
      q: query.q === undefined || query.q === "" ? null : query.q,
      sort: sort === undefined ? null : SORT_COLUMNS[sort],
      direction: query.direction ?? "asc",
    });
    return rows.map(toFolderRecord);
  };

  const fetch = async (id: number): Promise<FolderRecord | null> => {
    const row = await db.admin.folders.fetch.first({ id });
    return row === null ? null : toFolderRecord(row);
  };

  /** A new folder, inside the one named, or at the top. */
  const create = (
    body: FolderBody,
    parent?: number,
  ): Promise<FolderRecord | FolderConflict | null> =>
    orRefused(FOLDER_REFUSALS, async () => {
      const written = await db.admin.folders.create.first(
        toFolderArguments(body, parent),
      );
      return written === null ? null : fetch(written.id);
    });

  /** A folder renamed, where it stands. */
  const update = (
    id: number,
    body: FolderBody,
  ): Promise<FolderRecord | FolderConflict | null> =>
    orRefused(FOLDER_REFUSALS, async () => {
      const written = await db.admin.folders.update.first({
        id,
        name: body.name,
      });
      return written === null ? null : fetch(id);
    });

  /**
   * Where a folder is, on its own: inside the folder named, or at the top
   * when none is. A folder is never moved into itself, nor under a folder
   * of its own: that is refused.
   */
  const setParent = (
    id: number,
    parent?: number,
  ): Promise<FolderRecord | FolderRefusal | FolderConflict> =>
    orRefused(FOLDER_REFUSALS, async () => {
      if ((await fetch(id)) === null) return "missing";
      const written = await db.admin.folders.parent.first({
        id,
        parent_id: parent ?? null,
      });
      return written === null ? "refused" : ((await fetch(id)) ?? "missing");
    });

  /**
   * Removes a folder that holds nothing. One with a folder or a page still
   * in it is refused, and what it holds stays where it is.
   */
  const remove = async (id: number): Promise<true | FolderRefusal> => {
    if ((await fetch(id)) === null) return "missing";
    const deleted = await db.admin.folders.delete({ id });
    return deleted > 0 ? true : "refused";
  };

  return { list, fetch, create, update, setParent, remove };
};
