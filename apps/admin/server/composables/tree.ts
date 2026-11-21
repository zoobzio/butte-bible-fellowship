import type {
  ContentArticle,
  ContentEntry,
  ContentLocation,
  ContentQuery,
  ContentRecord,
  ContentResource,
  FolderRecord,
} from "@bbf/schema/types";

import type { ContentRefusal } from "~~/server/composables/content";
import type {
  FolderConflict,
  FolderRefusal,
} from "~~/server/composables/folders";

import { useDatabase } from "#layers/bbf/server/composables/database";

import { useContent } from "~~/server/composables/content";
import { useFolders } from "~~/server/composables/folders";

/**
 * What a path of the content names: a folder, by its id, the top having
 * none, or a document, by its.
 */
export type Located =
  | { kind: "folder"; id?: number }
  | { kind: "document"; id: number };

/**
 * The content as its paths name it: the names of the folders from the top
 * down, and last, for a document, its slug. A path is what the admin's
 * address and its API name a folder or a document by; each is found by it
 * here, and read or written by its id from there. `missing` is what a
 * write comes to when its path names nothing.
 */
export const useContentTree = () => {
  const db = useDatabase();
  const content = useContent();
  const folders = useFolders();

  /**
   * What a path names. The folders are walked from the top, a step to a
   * name: every name a folder's, and it is that folder; every name but the
   * last, and it is the document of that slug filed in the folder they
   * come to. A folder and a document beside one another never share a
   * name, so a path names one thing or nothing.
   */
  const locate = async (path: ContentLocation): Promise<Located | null> => {
    if (path.length === 0) return { kind: "folder" };
    const steps = await db.admin.folders.walk({ path: JSON.stringify(path) });
    const last = steps.at(-1)?.id;
    if (steps.length === path.length) return { kind: "folder", id: last };
    const slug = path.at(-1);
    if (steps.length < path.length - 1 || slug === undefined) return null;
    const found = await db.admin.content.locate.first({
      folder_id: last ?? null,
      slug,
    });
    return found === null ? null : { kind: "document", id: found.id };
  };

  /**
   * What a path names, as the admin reads it: a document, or a folder with
   * what it holds, the folders inside it and the documents filed in it,
   * which the query searches and sorts together. None when it names
   * nothing.
   */
  const read = async (
    path: ContentLocation,
    query: ContentQuery,
  ): Promise<ContentResource | null> => {
    const at = await locate(path);
    if (at === null) return null;
    if (at.kind === "document") {
      const record = await content.fetch(at.id);
      return record === null ? null : { kind: "document", record };
    }
    const [folder, inside, files] = await Promise.all([
      at.id === undefined ? undefined : folders.fetch(at.id),
      folders.list(at.id, query),
      content.list(at.id, query),
    ]);
    if (folder === null) return null;
    return { kind: "folder", folder, folders: inside, files };
  };

  /**
   * A new document or a new folder, made in the folder the path names:
   * `missing` when it names none.
   */
  const create = async (
    path: ContentLocation,
    entry: ContentEntry,
  ): Promise<
    | ContentRecord
    | FolderRecord
    | ContentRefusal
    | FolderConflict
    | "missing"
    | null
  > => {
    const at = await locate(path);
    if (at?.kind !== "folder") return "missing";
    if (entry.kind === "folder") {
      return folders.create({ name: entry.name }, at.id);
    }
    const { kind: _kind, ...body } = entry;
    return content.create(body, at.id);
  };

  /**
   * What a path names, moved into the folder another names, or to the top:
   * `missing` when the first names nothing, the top included, which is
   * never moved; `gone` when the second names no folder.
   */
  const move = async (
    path: ContentLocation,
    parent: ContentLocation,
  ): Promise<
    | ContentRecord
    | FolderRecord
    | ContentRefusal
    | FolderConflict
    | FolderRefusal
  > => {
    const [at, into] = await Promise.all([locate(path), locate(parent)]);
    if (at === null || at.id === undefined) return "missing";
    if (into?.kind !== "folder") return "gone";
    if (at.kind === "folder") return folders.setParent(at.id, into.id);
    return (await content.setFolder(at.id, into.id)) ?? "missing";
  };

  /**
   * What is written on the document a path names, on its own: `missing`
   * when it names nothing, `refused` when it names a folder, on which
   * nothing is written.
   */
  const write = async (
    path: ContentLocation,
    article: ContentArticle,
  ): Promise<ContentRecord | FolderRefusal> => {
    const at = await locate(path);
    if (at === null) return "missing";
    if (at.kind === "folder") return "refused";
    return (await content.setBody(at.id, article)) ?? "missing";
  };

  /**
   * Removes what a path names: a document, or a folder that holds nothing.
   * `missing` when it names nothing, the top included, which is never
   * removed; `refused` for a folder with something still in it.
   */
  const remove = async (
    path: ContentLocation,
  ): Promise<true | FolderRefusal> => {
    const at = await locate(path);
    if (at === null || at.id === undefined) return "missing";
    if (at.kind === "folder") return folders.remove(at.id);
    return (await content.remove(at.id)) ? true : "missing";
  };

  return { locate, read, create, move, write, remove };
};
