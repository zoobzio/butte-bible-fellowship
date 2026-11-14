import type { OutlineEntry } from "#layers/bbf/app/types/outline";
import type { Service } from "@zoobzio/editor";
import type { Ref } from "#imports";

import { onMounted, watch } from "#imports";
import { anchor } from "~/utils/outline";

/** What of a piece of writing its outline is told from. */
interface Written {
  editor: Service<string, string>;
  view: Readonly<Ref<number>>;
  editing: Readonly<Ref<boolean>>;
  outline: Readonly<Ref<OutlineEntry[]>>;
}

/**
 * Tells the table of contents of a piece of writing, a page's body, an
 * event's or a member's bio, as it is written, once its headings can be
 * linked to. The editor gives its headings their ids once it is on. Until
 * then the writing is drawn as plain HTML under `root`, whose headings
 * are given theirs here, each time it is drawn; `tell` is called only
 * after, so that whatever lists the outline finds the headings it links to.
 */
export const useEditorOutline = (
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
