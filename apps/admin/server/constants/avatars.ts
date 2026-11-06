/**
 * The kind of image each extension a photo is kept under names: the kinds
 * the schema's `staffAvatar` takes, and no other.
 */
export const AVATAR_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** The hosts Vercel Blob serves a store's files from. */
export const BLOB_HOST = ".blob.vercel-storage.com";

/** Where the development store's photos are read from, and kept under. */
export const AVATAR_ROUTE = "/avatars";
export const AVATAR_KEY = "avatars";

/** A photo's name in the development store: a stem and its extension. */
export const AVATAR_NAME = /^[\w-]+\.(\w+)$/;

/** The field of the upload's form that carries the image. */
export const AVATAR_FIELD = "file";

/**
 * What a form adds around the image it carries, in bytes: the boundaries
 * and the part's headers, with room to spare.
 */
export const AVATAR_FORM_SPARE = 64 * 1024;
