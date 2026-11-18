import type { HomeForm, HomeRecord } from "@bbf/schema/types";

import { HOME_IMAGE_TYPES, homeForm, homeRecord } from "@bbf/schema";
import { toHomeBody, toHomeForm } from "@bbf/utils/vm";
import { useNuxtApp } from "#imports";
import { blank, useSiteEditor } from "~/composables/site/editor";
import { HOME, image } from "~/composables/site/routes";

/**
 * The form of the home page's metadata: what the browser and search
 * engines show for it, and the words of the hero it opens with. The
 * heading is one line of text: what is written between asterisks in it
 * (**like this**) is what the site draws as the highlight. The hero's
 * picture is one of the fields: the one the page keeps, an image picked to
 * take its place, or none, for the site's own picture to stand in. What is
 * written under the hero is written on its own, beside the form.
 */
export const useHomeEditor = (record: HomeRecord) => {
  const { $t } = useNuxtApp();

  return useSiteEditor<HomeForm, HomeRecord>(record, {
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
        type: "image",
        key: "heroImage",
        label: $t.admin.home.image(),
        accept: HOME_IMAGE_TYPES.join(","),
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
    picture: {
      endpoint: image(HOME),
      held: (form) => form.heroImage,
      kept: (saved) => saved.heroImage,
      labels: {
        upload: $t.admin.home.imageUpload(),
        change: $t.admin.home.imageChange(),
        remove: $t.admin.home.imageRemove(),
        none: $t.admin.home.imageNone(),
      },
    },
  });
};
