import type { FormOptions } from "#imports";
import type { ZodType } from "zod";

import type { Metadata } from "~/types/editor";

import { computed, createForm, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { failure } from "~/utils/errors";

/**
 * What tells one page's metadata from another's: the form's id, fields
 * and schema; where the metadata is written, and the schema of the record
 * that answers; and the record as the form holds it, and the form as the
 * body the API takes.
 */
export interface SettingsForm<Form, Saved> extends Pick<
  FormOptions<Form>,
  "fields" | "schema" | "middleware"
> {
  id: string;
  endpoint: string;
  record: ZodType<Saved>;
  toForm: (record: Saved) => Form;
  toBody: (form: Form) => Record<string, unknown>;
}

/**
 * An optional field once cleared: the control writes an empty string, the
 * body wants nothing. What is written is kept as typed; the body trims it.
 */
export const blank = (value: string | undefined): string | undefined =>
  value?.trim() === "" ? undefined : value;

/**
 * The form of the metadata of a page of the site with a table of its own:
 * what the browser and search engines show for it, and whatever else its
 * layout shows that is no part of the writing. It is one column of fields.
 * There is always a record: such a page is neither added nor removed. The
 * form's store is shared under its id, so each visit starts over from the
 * record.
 *
 * A save stays on the page, the fields showing what was kept. One that
 * fails reports through `error`, which the next submit clears. For the bar
 * that saves the page as a whole, `dirty` holds from the first change to
 * the next save, `save` submits the form without throwing, and `reset`
 * puts the fields back as they were last saved.
 */
export const useSettingsEditor = <Form, Saved>(
  record: Saved,
  {
    id,
    endpoint,
    record: schema,
    toForm,
    toBody,
    ...options
  }: SettingsForm<Form, Saved>,
): Metadata<Form> => {
  const api = useApi();
  const { $t } = useNuxtApp();

  /* The record as it was last saved: what a reset puts back. */
  let kept = record;

  const useForm = createForm<Form>(id, {
    ...options,
    submit: async (form) => {
      const body = toBody(options.schema.parse(form.payload));
      kept = schema.parse(await api(endpoint, { method: "PUT", body }));
      form.update(toForm(kept));
    },
  });

  const form = useForm();
  const dirty = ref(false);
  const error = ref<string | null>(null);

  const fill = () => {
    form.reset();
    form.update(toForm(kept));
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
