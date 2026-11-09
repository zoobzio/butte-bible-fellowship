import type { EventRecord, StaffRecord } from "@bbf/schema/types";
import type { H3Event } from "h3";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import { getRequestURL } from "h3";
import { useStorage } from "nitropack/runtime";
import { keys } from "objectively";

import { useEvents } from "~~/server/composables/events";
import { useStaff } from "~~/server/composables/staff";
import {
  AVATAR_KEY,
  AVATAR_ROUTE,
  AVATAR_TYPES,
  BLOB_HOST,
} from "~~/server/constants/avatars";

/**
 * Where the pictures are kept: the staff's photos, and the events'
 * pictures. `put` keeps a record's picture under a name no other has and
 * answers with the URL it is read at; `remove` drops a picture the store
 * keeps, and leaves a URL that is another's alone.
 */
export interface AvatarStore {
  put: (id: number, file: File) => Promise<string>;
  remove: (url: string) => Promise<void>;
}

/** The folder the staff's photos are kept in, and the events' pictures. */
export const STAFF_FOLDER = "staff";
export const EVENT_FOLDER = "events";

/** The extension a photo is kept under, by its kind. */
const extension = (file: File): string =>
  keys(AVATAR_TYPES).find((name) => AVATAR_TYPES[name] === file.type) ?? "bin";

/**
 * Vercel Blob, as the deployment keeps the photos: public, each under a
 * name Vercel makes unique, so a new photo never hides behind a cache of
 * the last. The store is the one `BLOB_READ_WRITE_TOKEN` names; `folder`
 * sets one kind of record's pictures apart from another's.
 */
export const useBlobStore = (folder = STAFF_FOLDER): AvatarStore => ({
  put: async (id, file) => {
    const blob = await put(`${folder}/${id}.${extension(file)}`, file, {
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
 * `/avatars`, under the origin the request came to. A member's photo is
 * named by their id, and another kind of record's by its folder first.
 */
export const useLocalStore = (
  event: H3Event,
  folder = STAFF_FOLDER,
): AvatarStore => {
  const files = useStorage("data");
  const base = `${getRequestURL(event).origin}${AVATAR_ROUTE}/`;
  const stem = folder === STAFF_FOLDER ? "" : `${folder}-`;
  return {
    put: async (id, file) => {
      const name = `${stem}${id}-${randomUUID()}.${extension(file)}`;
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
export const useAvatarStore = (
  event: H3Event,
  folder = STAFF_FOLDER,
): AvatarStore =>
  import.meta.dev && !process.env.BLOB_READ_WRITE_TOKEN
    ? useLocalStore(event, folder)
    : useBlobStore(folder);

/** How a kind of record's picture is read and written. */
export interface Pictured<R> {
  fetch: (id: number) => Promise<R | null>;
  set: (id: number, url: string | null) => Promise<R | null>;
  of: (record: R) => string | undefined;
}

/**
 * A record's picture, written on its own: `replace` keeps the file and
 * points the record at it, `clear` leaves it without one. Either answers
 * with the record, or nothing when no record has the id. The picture a
 * record had is dropped once nothing shows it, as `discard` does for a
 * record that is deleted; one that cannot be dropped is left behind rather
 * than failing the save it follows.
 */
export const usePictures = <R>(store: AvatarStore, records: Pictured<R>) => {
  const discard = async (url: string | undefined) => {
    if (url === undefined) return;
    try {
      await store.remove(url);
    } catch (error) {
      console.warn(`Avatar left in the store: ${url}`, error);
    }
  };

  const replace = async (id: number, file: File): Promise<R | null> => {
    const current = await records.fetch(id);
    if (current === null) return null;
    const url = await store.put(id, file);
    let record: R | null;
    try {
      record = await records.set(id, url);
    } catch (error) {
      await discard(url);
      throw error;
    }
    await discard(record === null ? url : records.of(current));
    return record;
  };

  const clear = async (id: number): Promise<R | null> => {
    const current = await records.fetch(id);
    if (current === null) return null;
    const record = await records.set(id, null);
    if (record !== null) await discard(records.of(current));
    return record;
  };

  return { replace, clear, discard };
};

/** A member's photo, written on its own, kept with the staff's. */
export const useStaffAvatar = (event: H3Event) => {
  const staff = useStaff();
  return usePictures<StaffRecord>(useAvatarStore(event, STAFF_FOLDER), {
    fetch: staff.fetch,
    set: staff.setPhoto,
    of: (record) => record.photo,
  });
};

/** An event's picture, written on its own, kept with the events'. */
export const useEventImage = (event: H3Event) => {
  const events = useEvents();
  return usePictures<EventRecord>(useAvatarStore(event, EVENT_FOLDER), {
    fetch: events.fetch,
    set: events.setImage,
    of: (record) => record.image,
  });
};
