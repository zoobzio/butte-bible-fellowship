import type { PageLink } from "~/types/navigation";
import type { AppearanceEditor, Section } from "~/types/settings";

import { computed, useRoute } from "#imports";
import { isWithin } from "#layers/bbf/app/utils/navigation";

/**
 * The sections of a page of settings, as the menu beside them lists them:
 * each a link to a page of its own, the one being read marked, and each
 * with what its `editor` says of its form, read or not: that it holds
 * changes not saved, or that a save found something wrong in it.
 */
export const useSections = (
  pages: () => (PageLink & {
    editor: Pick<AppearanceEditor, "dirty" | "invalid">;
  })[],
) => {
  const route = useRoute();

  return computed((): Section[] =>
    pages().map(({ editor, ...page }) => ({
      ...page,
      current: isWithin(route.path, page.to),
      unsaved: editor.dirty.value,
      invalid: editor.invalid.value,
    })),
  );
};
