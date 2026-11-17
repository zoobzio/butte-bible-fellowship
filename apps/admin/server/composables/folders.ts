import type {
  FolderBody,
  FolderDraft,
  FolderPlacement,
  FolderRecord,
  FolderRecords,
  FolderSort,
  FoldersQuery,
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
 * What the database refuses a write of a folder over: `taken`, a folder
 * beside it already has the name; `gone`, the folder it was to be inside
 * is not there.
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

export const useFolders = () => {
  const db = useDatabase();

  /**
   * The folders inside one, or at the top when the query names none: all
   * of them, or the ones the text searched for names, by the column the
   * query sorts by, ascending unless told otherwise, and by name without
   * one.
   */
  const list = async (query: FoldersQuery): Promise<FolderRecords> => {
    const rows = await db.admin.folders.list({
      parent_id: query.parent ?? null,
      q: query.q === undefined || query.q === "" ? null : query.q,
      sort: query.sort === undefined ? null : SORT_COLUMNS[query.sort],
      direction: query.direction ?? "asc",
    });
    return rows.map(toFolderRecord);
  };

  const fetch = async (id: number): Promise<FolderRecord | null> => {
    const row = await db.admin.folders.fetch.first({ id });
    return row === null ? null : toFolderRecord(row);
  };

  /** A new folder, inside the one its draft names, or at the top. */
  const create = (
    draft: FolderDraft,
  ): Promise<FolderRecord | FolderConflict | null> =>
    orRefused(FOLDER_REFUSALS, async () => {
      const written = await db.admin.folders.create.first(
        toFolderArguments(draft),
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
   * Where a folder is, on its own: inside the folder the placement names,
   * or at the top when it names none. A folder is never moved into itself,
   * nor under a folder of its own: that is refused.
   */
  const setParent = (
    id: number,
    placement: FolderPlacement,
  ): Promise<FolderRecord | FolderRefusal | FolderConflict> =>
    orRefused(FOLDER_REFUSALS, async () => {
      if ((await fetch(id)) === null) return "missing";
      const written = await db.admin.folders.parent.first({
        id,
        parent_id: placement.parent ?? null,
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
