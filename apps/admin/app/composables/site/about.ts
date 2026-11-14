import type { AboutForm, AboutRecord } from "@bbf/schema/types";

import { aboutForm, aboutRecord } from "@bbf/schema";
import { toAboutBody, toAboutForm } from "@bbf/utils/vm";
import { useNuxtApp } from "#imports";
import { blank, useSiteEditor } from "~/composables/site/editor";
import { ABOUT } from "~/composables/site/routes";

/**
 * The form of About Us's metadata: the title and the description the page
 * opens with, which the browser and search engines show for it too. What
 * is written under them is written on its own, beside the form.
 */
export const useAboutEditor = (record: AboutRecord) => {
  const { $t } = useNuxtApp();

  return useSiteEditor<AboutForm, AboutRecord>(record, {
    id: "about",
    fields: [
      {
        type: "text",
        key: "title",
        label: $t.admin.page.title(),
        required: true,
      },
      {
        type: "textarea",
        key: "description",
        label: $t.admin.page.description(),
        rows: 3,
      },
    ],
    schema: aboutForm,
    middleware: { description: blank },
    endpoint: ABOUT,
    record: aboutRecord,
    toForm: toAboutForm,
    toBody: toAboutBody,
  });
};
