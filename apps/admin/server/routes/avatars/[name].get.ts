import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeader,
} from "h3";
import { useStorage } from "nitropack/runtime";

import {
  AVATAR_KEY,
  AVATAR_NAME,
  AVATAR_TYPES,
} from "~~/server/constants/avatars";

/**
 * A photo of the development store, read back: what `useLocalStore` kept,
 * by name. A deployment keeps its photos in Vercel Blob, which serves
 * them itself, so there is nothing here outside development.
 */
export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, "name") ?? "";
  const type = AVATAR_TYPES[AVATAR_NAME.exec(name)?.[1] ?? ""];
  const file =
    import.meta.dev && type !== undefined
      ? await useStorage("data").getItemRaw(`${AVATAR_KEY}:${name}`)
      : null;
  if (file === null || file === undefined) {
    throw createError({ statusCode: 404, message: "Photo not found" });
  }
  setResponseHeader(event, "content-type", type!);
  return file;
});
