import type { EventRecord } from "@bbf/schema/types";

import { EVENT_IMAGE_TYPES, eventImage, eventRecord } from "@bbf/schema";
import { computed, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { image } from "~/composables/events/routes";
import { failure } from "~/utils/errors";

/**
 * An event's picture, written on its own: `pick` uploads the image chosen
 * and `remove` leaves the event without one, each in a request of its own,
 * apart from the form of its details. `picture` follows what the server
 * answers with, so the picture shown is the one kept. `accept` is the
 * kinds of image the schema takes, for the picker to offer. An image the
 * schema would refuse is never sent; what fails reports through `error`,
 * which the next try clears.
 */
export const useEventImage = (record: EventRecord) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const picture = ref(record.image);
  const accept = EVENT_IMAGE_TYPES.join(",");
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
      picture.value = eventRecord.parse(await request()).image;
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
    if (!eventImage.safeParse(file).success) {
      error.value = $t.admin.event.imageInvalid();
      return;
    }
    files.value = picked;
    const body = new FormData();
    body.append("file", file);
    await run(uploading, () =>
      api(image(record.id), { method: "PATCH", body }),
    );
    files.value = [];
  };

  const remove = async () => {
    if (
      !globalThis.confirm($t.admin.event.imageConfirm({ name: record.title }))
    ) {
      return;
    }
    await run(removing, () => api(image(record.id), { method: "DELETE" }));
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
