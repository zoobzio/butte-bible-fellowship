import type { ContentForm, ContentRecord } from "@bbf/schema/types";

import { contentForm, contentRecord } from "@bbf/schema";
import { toContentBody, toContentForm } from "@bbf/utils/vm";
import { createForm, ref, useNuxtApp, useRouter } from "#imports";
import { useApi } from "~/composables/api";
import { ROUTE, endpoint } from "~/composables/content/routes";
import { link } from "~/constants/content";
import { failure } from "~/utils/errors";

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

/**
 * The form of one page's metadata, what its front matter carried when the
 * pages were Markdown: a new page when there is no record. It is one column
 * of fields: where the page is, and what the browser and search engines
 * show for it. What is written on the page is written on its own, beside
 * the form. The form's store is shared under its id, so
 * each visit starts over from the record.
 *
 * A new page saved opens on its own page, where the writing waits; one
 * changed stays on the page, its fields showing what was kept, and the
 * record saved is handed to `saved`, for the page to name it afresh. A save
 * that fails reports through `error`, which the next submit clears.
 */
export const useContentEditor = (
  record: ContentRecord | null,
  saved: (record: ContentRecord) => void = () => {},
) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  const useForm = createForm<ContentForm>("content", {
    fields: [
      {
        type: "text",
        key: "title",
        label: $t.admin.page.title(),
        required: true,
      },
      {
        type: "text",
        key: "slug",
        label: $t.admin.editor.slug(),
        hint: $t.admin.page.slugHint(),
        required: true,
      },
      {
        type: "textarea",
        key: "description",
        label: $t.admin.page.description(),
        rows: 3,
      },
    ],
    schema: contentForm,
    middleware: { description: blank },
    submit: async (form) => {
      const body = toContentBody(contentForm.parse(form.payload));
      if (record === null) {
        const created = await api(ROUTE, { method: "POST", body });
        await router.push(link(contentRecord.parse(created)));
        return;
      }
      const changed = contentRecord.parse(
        await api(endpoint(record.id), { method: "PUT", body }),
      );
      form.update(toContentForm(changed));
      saved(changed);
    },
  });

  const form = useForm();
  form.reset();
  if (record !== null) form.update(toContentForm(record));

  const error = ref<string | null>(null);

  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  return { form, error };
};
