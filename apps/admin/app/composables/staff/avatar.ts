import type { StaffRecord } from "@bbf/schema/types";

import { STAFF_AVATAR_TYPES, staffAvatar, staffRecord } from "@bbf/schema";
import { computed, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { avatar } from "~/composables/staff/routes";
import { failure } from "~/utils/errors";
import { initials } from "~/utils/staff";

/**
 * A member's photo, written on its own: `pick` uploads the image chosen
 * and `remove` leaves the member without one, each in a request of its
 * own, apart from the form of their details. `photo` follows what the
 * server answers with, so the picture shown is the one kept, and
 * `fallback` is the initials that stand in for none. `accept` is the kinds
 * of image the schema takes, for the picker to offer. An image the schema
 * would refuse is never sent; what fails reports through `error`, which
 * the next try clears.
 */
export const useStaffAvatar = (record: StaffRecord) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const photo = ref(record.photo);
  const fallback = initials(record.name);
  const accept = STAFF_AVATAR_TYPES.join(",");
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
      photo.value = staffRecord.parse(await request()).photo;
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
    if (!staffAvatar.safeParse(file).success) {
      error.value = $t.admin.member.photoInvalid();
      return;
    }
    files.value = picked;
    const body = new FormData();
    body.append("file", file);
    await run(uploading, () =>
      api(avatar(record.id), { method: "PATCH", body }),
    );
    files.value = [];
  };

  const remove = async () => {
    if (
      !globalThis.confirm($t.admin.member.photoConfirm({ name: record.name }))
    ) {
      return;
    }
    await run(removing, () => api(avatar(record.id), { method: "DELETE" }));
  };

  return {
    photo,
    fallback,
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
