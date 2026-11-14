import type { OutlineEntry } from "#layers/bbf/app/types/outline";
import type { Service } from "@zoobzio/editor";
import type { Ref } from "#imports";

import { onMounted, watch } from "#imports";
import { anchor } from "~/utils/outline";

/** What of a page's body its outline is told from. */
interface Written {
  editor: Service<string, string>;
  view: Readonly<Ref<number>>;
  editing: Readonly<Ref<boolean>>;
  outline: Readonly<Ref<OutlineEntry[]>>;
}

/**
 * Tells a page's table of contents as it is written, once its headings can
 * be linked to. The editor gives its headings their ids once it is on.
 * Until then the page is drawn as plain HTML under `root`, whose headings
 * are given theirs here, each time it is drawn; `tell` is called only
 * after, so that whatever lists the outline finds the headings it links to.
 */
export const useContentOutline = (
  root: Readonly<Ref<HTMLElement | null>>,
  { editor, view, editing, outline }: Written,
  tell: (entries: OutlineEntry[]) => void,
): void => {
  const settle = () => {
    const page = root.value?.querySelector(".f-data-editor-content");
    if (!page) return;
    if (!editing.value) anchor(page, editor.json);
    tell(outline.value);
  };

  watch([view, outline], settle, { flush: "post" });
  onMounted(settle);
};
