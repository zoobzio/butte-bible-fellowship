import type { StaffRecord } from "@bbf/schema/types";
import type { H3Event } from "h3";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import { getRequestURL } from "h3";
import { useStorage } from "nitropack/runtime";
import { keys } from "objectively";

import { useStaff } from "~~/server/composables/staff";
import {
  AVATAR_KEY,
  AVATAR_ROUTE,
  AVATAR_TYPES,
  BLOB_HOST,
} from "~~/server/constants/avatars";

/**
 * Where the photos are kept. `put` keeps a member's photo under a name no
 * other has and answers with the URL it is read at; `remove` drops a photo
 * the store keeps, and leaves a URL that is another's alone.
 */
export interface AvatarStore {
  put: (id: number, file: File) => Promise<string>;
  remove: (url: string) => Promise<void>;
}

/** The extension a photo is kept under, by its kind. */
const extension = (file: File): string =>
  keys(AVATAR_TYPES).find((name) => AVATAR_TYPES[name] === file.type) ?? "bin";

/**
 * Vercel Blob, as the deployment keeps the photos: public, each under a
 * name Vercel makes unique, so a new photo never hides behind a cache of
 * the last. The store is the one `BLOB_READ_WRITE_TOKEN` names.
 */
export const useBlobStore = (): AvatarStore => ({
  put: async (id, file) => {
    const blob = await put(`staff/${id}.${extension(file)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  },
  remove: async (url) => {
    if (URL.canParse(url) && new URL(url).hostname.endsWith(BLOB_HOST)) {
      await del(url);
    }
  },
});

/**
 * The server's own data directory, as development keeps the photos when
 * there is no Blob store to write to: read back from this app, at
 * `/avatars`, under the origin the request came to.
 */
export const useLocalStore = (event: H3Event): AvatarStore => {
  const files = useStorage("data");
  const base = `${getRequestURL(event).origin}${AVATAR_ROUTE}/`;
  return {
    put: async (id, file) => {
      const name = `${id}-${randomUUID()}.${extension(file)}`;
      await files.setItemRaw(
        `${AVATAR_KEY}:${name}`,
        new Uint8Array(await file.arrayBuffer()),
      );
      return `${base}${name}`;
    },
    remove: async (url) => {
      if (url.startsWith(base)) {
        await files.removeItem(`${AVATAR_KEY}:${url.slice(base.length)}`);
      }
    },
  };
};

/**
 * The store the photos are kept in: Vercel Blob, or in development with no
 * token for one, the server's data directory.
 */
export const useAvatarStore = (event: H3Event): AvatarStore =>
  import.meta.dev && !process.env.BLOB_READ_WRITE_TOKEN
    ? useLocalStore(event)
    : useBlobStore();

/**
 * A member's photo, written on its own: `replace` keeps the file and
 * points the member at it, `clear` leaves them without one. Either answers
 * with the record, or nothing when no member has the id. The photo a
 * member had is dropped once nothing shows it, as `discard` does for a
 * member who is deleted; one that cannot be dropped is left behind rather
 * than failing the save it follows.
 */
export const useStaffAvatar = (event: H3Event) => {
  const staff = useStaff();
  const store = useAvatarStore(event);

  const discard = async (url: string | undefined) => {
    if (url === undefined) return;
    try {
      await store.remove(url);
    } catch (error) {
      console.warn(`Avatar left in the store: ${url}`, error);
    }
  };

  const replace = async (
    id: number,
    file: File,
  ): Promise<StaffRecord | null> => {
    const current = await staff.fetch(id);
    if (current === null) return null;
    const url = await store.put(id, file);
    let record: StaffRecord | null;
    try {
      record = await staff.setPhoto(id, url);
    } catch (error) {
      await discard(url);
      throw error;
    }
    await discard(record === null ? url : current.photo);
    return record;
  };

  const clear = async (id: number): Promise<StaffRecord | null> => {
    const current = await staff.fetch(id);
    if (current === null) return null;
    const record = await staff.setPhoto(id, null);
    if (record !== null) await discard(current.photo);
    return record;
  };

  return { replace, clear, discard };
};
