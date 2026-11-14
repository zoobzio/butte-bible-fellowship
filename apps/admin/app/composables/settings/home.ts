import type { HomeForm, HomeRecord } from "@bbf/schema/types";

import { homeForm, homeRecord } from "@bbf/schema";
import { toHomeBody, toHomeForm } from "@bbf/utils/vm";
import { useNuxtApp } from "#imports";
import { blank, useSettingsEditor } from "~/composables/settings/editor";
import { HOME } from "~/composables/settings/routes";

/**
 * The form of the home page's metadata: what the browser and search
 * engines show for it, and the words of the hero it opens with. The
 * heading is one line of text: what is written between asterisks in it
 * (**like this**) is what the site draws as the highlight. The hero's
 * picture and what is written under the hero are each written on their
 * own, beside the form.
 */
export const useHomeEditor = (record: HomeRecord) => {
  const { $t } = useNuxtApp();

  return useSettingsEditor<HomeForm, HomeRecord>(record, {
    id: "home",
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
      {
        type: "text",
        key: "heroHeading",
        label: $t.admin.home.heading(),
        required: true,
      },
      {
        type: "textarea",
        key: "heroDescription",
        label: $t.admin.home.description(),
        rows: 4,
        required: true,
      },
      {
        type: "text",
        key: "heroAction",
        label: $t.admin.home.action(),
        required: true,
      },
      {
        type: "text",
        key: "heroLink",
        label: $t.admin.home.link(),
        required: true,
      },
    ],
    schema: homeForm,
    middleware: { description: blank },
    endpoint: HOME,
    record: homeRecord,
    toForm: toHomeForm,
    toBody: toHomeBody,
  });
};
