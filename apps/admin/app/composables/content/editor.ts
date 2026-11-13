import type { ContentForm, ContentRecord } from "@bbf/schema/types";

import { contentForm, contentRecord } from "@bbf/schema";
import { toContentBody, toContentForm } from "@bbf/utils/vm";
import { computed, createForm, ref, useNuxtApp, useRouter } from "#imports";
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
 *
 * For the page that saves the page as a whole, `dirty` holds from the
 * first change to the next save, `save` submits the form without throwing,
 * and `reset` puts the fields back as they were last saved.
 */
export const useContentEditor = (
  record: ContentRecord | null,
  saved: (record: ContentRecord) => void = () => {},
) => {
  const api = useApi();
  const router = useRouter();
  const { $t } = useNuxtApp();

  /* The record as it was last saved: what a reset puts back. */
  let kept = record;

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
      kept = changed;
      form.update(toContentForm(changed));
      saved(changed);
    },
  });

  const form = useForm();
  const dirty = ref(false);
  const error = ref<string | null>(null);

  const fill = () => {
    form.reset();
    if (kept !== null) form.update(toContentForm(kept));
    dirty.value = false;
  };
  fill();

  form.on("change", ({ field }) => {
    if (field === "payload") dirty.value = true;
  });
  form.on("submitted", () => {
    error.value = null;
    dirty.value = false;
  });
  form.on("rejected", () => {
    error.value = null;
  });
  form.on("failed", ({ cause }) => {
    error.value = failure(cause) ?? $t.admin.editor.failed();
  });

  const saving = computed(() => form.submitting);

  /* What fails reports through `error`: the rejection has no other use. */
  const save = async () => {
    await form.submit().catch(() => {});
  };

  const reset = () => {
    if (form.submitting) return;
    error.value = null;
    fill();
  };

  return { form, error, dirty, saving, save, reset };
};
