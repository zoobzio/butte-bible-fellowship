import type {
  ContentLocation,
  ContentRecord,
  ContentResource,
  FolderRecord,
} from "@bbf/schema/types";
import type { H3Event } from "h3";

import {
  contentBody,
  contentEntry,
  contentPatch,
  contentQuery,
  folderBody,
} from "@bbf/schema";
import {
  createError,
  getRouterParam,
  getValidatedQuery,
  readValidatedBody,
  setResponseStatus,
} from "h3";

import { useContent } from "~~/server/composables/content";
import { useFolders } from "~~/server/composables/folders";
import { useContentTree } from "~~/server/composables/tree";
import { toLocation } from "~~/server/utils/paths";

/** What a request is told when its path names nothing. */
const nowhere = () =>
  createError({ statusCode: 404, message: "Nothing is at that path" });

/** What a write is told when what it names is already something's name. */
const taken = (where: "here" | "there") =>
  createError({
    statusCode: 409,
    message: `Something ${where} already has that name`,
  });

const gone = () =>
  createError({ statusCode: 409, message: "The folder is gone" });

/**
 * The content's API, which is one route: whatever follows it is a path of
 * the content, the names of the folders from the top down and last, for a
 * document, its slug, and nothing follows it at the top. Each method does
 * to what the path names what the method says, for the request given, and
 * answers what the content refuses with the error the admin shows.
 */
export const useContentPaths = () => {
  const tree = useContentTree();

  /**
   * The path a request is addressed to: what follows the API's own route,
   * the top when nothing does. A path that could name nothing is a bad
   * request.
   */
  const locationOf = (event: H3Event): ContentLocation => {
    const location = toLocation(getRouterParam(event, "path"));
    if (location === undefined) {
      throw createError({ statusCode: 400, message: "No such path" });
    }
    return location;
  };

  /**
   * What the path names: a document, or a folder with what it holds, which
   * the query searches and sorts.
   */
  const read = async (event: H3Event): Promise<ContentResource> => {
    const path = locationOf(event);
    const query = await getValidatedQuery(event, contentQuery.parse);
    const resource = await tree.read(path, query);
    if (resource === null) throw nowhere();
    return resource;
  };

  /** A new document or a new folder, made in the folder the path names. */
  const create = async (
    event: H3Event,
  ): Promise<ContentRecord | FolderRecord> => {
    const path = locationOf(event);
    const entry = await readValidatedBody(event, contentEntry.parse);
    const record = await tree.create(path, entry);
    if (record === "missing") {
      throw createError({ statusCode: 404, message: "Folder not found" });
    }
    if (record === "taken") throw taken("here");
    if (record === "gone") throw gone();
    if (record === null) {
      throw createError({ statusCode: 500, message: "Nothing was written" });
    }
    setResponseStatus(event, 201);
    return record;
  };

  /**
   * What the path names, written anew where it stands: a document's
   * metadata, or a folder's name. Either may change the last step of its
   * own path. The top is neither, and is not written.
   */
  const update = async (
    event: H3Event,
  ): Promise<ContentRecord | FolderRecord> => {
    const at = await tree.locate(locationOf(event));
    if (at === null || at.id === undefined) throw nowhere();
    const record =
      at.kind === "folder"
        ? await useFolders().update(
            at.id,
            await readValidatedBody(event, folderBody.parse),
          )
        : await useContent().update(
            at.id,
            await readValidatedBody(event, contentBody.parse),
          );
    if (record === "taken") throw taken("here");
    if (record === null || record === "gone") throw nowhere();
    return record;
  };

  /**
   * One part of what the path names, written on its own: where it is,
   * moved into another folder or to the top, or what is written on a
   * document.
   */
  const patch = async (
    event: H3Event,
  ): Promise<ContentRecord | FolderRecord> => {
    const path = locationOf(event);
    const part = await readValidatedBody(event, contentPatch.parse);
    const moving = "parent" in part;
    const record = moving
      ? await tree.move(path, part.parent)
      : await tree.write(path, part);
    if (record === "missing") throw nowhere();
    if (record === "taken") throw taken("there");
    if (record === "gone") throw gone();
    if (record === "refused") {
      throw createError({
        statusCode: 409,
        message: moving
          ? "A folder cannot be moved into itself or a folder inside it"
          : "Nothing is written on a folder",
      });
    }
    return record;
  };

  /** What the path names, removed: a document, or a folder that holds nothing. */
  const remove = async (event: H3Event): Promise<null> => {
    const removed = await tree.remove(locationOf(event));
    if (removed === "missing") throw nowhere();
    if (removed === "refused") {
      throw createError({
        statusCode: 409,
        message: "The folder is not empty",
      });
    }
    setResponseStatus(event, 204);
    return null;
  };

  return { read, create, update, patch, remove };
};
