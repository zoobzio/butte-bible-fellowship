import type { SermonForm, SermonRecord } from "@bbf/schema/types";

import { CONTENT_STATUSES, sermonForm } from "@bbf/schema";
import { toSermonForm } from "@bbf/utils/vm";
import { createForm, useNuxtApp } from "#imports";

/**
 * The form of one sermon's details, as its page shows them: every field
 * of the sermon but what is written about it, each there to be read and
 * none to be changed, so every control is disabled and the form submits
 * nothing. The form's store is shared under its id, so each visit starts
 * over from the record. The form carries no title of its own: the page's
 * header names the sermon.
 */
export const useSermonForm = (record: SermonRecord) => {
  const { $t } = useNuxtApp();

  const useForm = createForm<SermonForm>("sermon", {
    fields: [
      {
        type: "text",
        key: "title",
        label: $t.admin.sermon.title(),
        disabled: true,
      },
      {
        type: "text",
        key: "speaker",
        label: $t.admin.sermon.speaker(),
        disabled: true,
      },
      {
        type: "date-input",
        key: "date",
        label: $t.admin.sermon.preached(),
        disabled: true,
      },
      {
        type: "textarea",
        key: "summary",
        label: $t.admin.editor.summary(),
        rows: 4,
        disabled: true,
      },
      {
        type: "text",
        key: "slug",
        label: $t.admin.editor.slug(),
        disabled: true,
      },
      {
        type: "select",
        key: "status",
        label: $t.admin.sermon.status(),
        options: CONTENT_STATUSES.map((value) => ({
          value,
          label: $t.admin.sermons[value](),
        })),
        disabled: true,
      },
      {
        type: "text",
        key: "video",
        label: $t.admin.sermon.video(),
        disabled: true,
      },
      {
        type: "url",
        key: "image",
        label: $t.admin.sermon.picture(),
        disabled: true,
      },
    ],
    schema: sermonForm,
    /* Nothing is written: the fields are read, and no button submits them. */
    submit: async () => {},
  });

  const form = useForm();
  form.reset();
  form.update(toSermonForm(record));

  return { form };
};
