import type { HomeRecord } from "@bbf/schema/types";

import { HOME_IMAGE_TYPES, homeImage, homeRecord } from "@bbf/schema";
import { computed, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { HOME, image } from "~/composables/site/routes";
import { failure } from "~/utils/errors";

/**
 * The picture of the home page's hero, written on its own, as an event's
 * is: `pick` uploads the image chosen and `remove` leaves the page without
 * one, for the site's own picture to stand in, each in a request of its
 * own, apart from the form of the metadata. `picture` follows what the
 * server answers with, so the picture shown is the one kept. `accept` is
 * the kinds of image the schema takes, for the picker to offer. An image
 * the schema would refuse is never sent; what fails reports through
 * `error`, which the next try clears.
 */
export const useHomeImage = (record: HomeRecord) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const address = image(HOME);
  const picture = ref(record.heroImage);
  const accept = HOME_IMAGE_TYPES.join(",");
  const files = ref<File[]>([]);
  const uploading = ref(false);
  const removing = ref(false);
  const busy = computed(() => uploading.value || removing.value);
  const error = ref<string | null>(null);

  const run = async (
    under: typeof uploading,
    request: () => Promise<unknown>,
  ) => {
    if (busy.value) return;
    error.value = null;
    under.value = true;
    try {
      picture.value = homeRecord.parse(await request()).heroImage;
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      under.value = false;
    }
  };

  /**
   * What the file input picked: at most one image. The list empties once
   * the upload settles, so the same file can be picked again.
   */
  const pick = async (picked: File[]) => {
    const [file] = picked;
    if (file === undefined) return;
    if (!homeImage.safeParse(file).success) {
      error.value = $t.admin.home.imageInvalid();
      return;
    }
    files.value = picked;
    const body = new FormData();
    body.append("file", file);
    await run(uploading, () => api(address, { method: "PATCH", body }));
    files.value = [];
  };

  const remove = async () => {
    if (!globalThis.confirm($t.admin.home.imageConfirm())) return;
    await run(removing, () => api(address, { method: "DELETE" }));
  };

  return {
    picture,
    accept,
    files,
    uploading,
    removing,
    busy,
    error,
    pick,
    remove,
  };
};
