import type { FolderBody } from "@bbf/schema/types";

import type { BrowserFolder } from "~/types/content";

import { folderBody } from "@bbf/schema";
import { createForm, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { FOLDERS, folder as endpoint } from "~/composables/content/routes";
import { failure } from "~/utils/errors";
import { folderId } from "~/utils/folders";

/**
 * The form of one folder, which is its name: a new folder, made inside
 * `parent`, or at the top when there is none, when no folder is given; the
 * folder given, renamed where it stands, otherwise. The form's store is
 * shared under its id, so each opening starts over from the folder. Once
 * saved, `saved` is told, for the page to list the folder afresh. A save
 * that fails reports through `error`, which the next submit clears.
 */
export const useFolderEditor = (
  folder: BrowserFolder | null,
  parent: number | undefined,
  saved: () => void = () => {},
) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const useForm = createForm<FolderBody>("folder", {
    fields: [
      {
        type: "text",
        key: "name",
        label: $t.admin.content.folderName(),
        required: true,
      },
    ],
    schema: folderBody,
    submit: async (form) => {
      const body = folderBody.parse(form.payload);
      await (folder === null
        ? api(FOLDERS, { method: "POST", body: { ...body, parent } })
        : api(endpoint(folderId(folder)), { method: "PUT", body }));
      saved();
    },
  });

  const form = useForm();
  const error = ref<string | null>(null);

  form.reset();
  if (folder !== null) form.update({ name: folder.label });

  form.on("submitted", () => {
    error.value = null;
  });
  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  return { form, error };
};
