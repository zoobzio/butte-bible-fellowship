import type { ImageRequest } from "~/types/editor";

/** The name an uploaded image goes under in the form that carries it. */
const FIELD = "file";

/**
 * What a save owes the server for a picture, as a form holds it against
 * the one the record keeps: an image picked is uploaded in its place, and
 * none where one is kept is a removal. The URL of the one kept, or none
 * where there is none, owes nothing, and is null.
 */
export const toImageRequest = (
  image: File | string | undefined,
  kept: string | undefined,
): ImageRequest | null => {
  if (image instanceof File) {
    const body = new FormData();
    body.append(FIELD, image);
    return { method: "PATCH", body };
  }
  if (image === undefined && kept !== undefined) return { method: "DELETE" };
  return null;
};
