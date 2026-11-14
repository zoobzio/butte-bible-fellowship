import type { ContentRecord } from "@bbf/schema/types";

import { contentArticle, contentRecord } from "@bbf/schema";
import { fromHtml, toHtml } from "@bbf/utils/vm";
import { html } from "@zoobzio/editor";
import { computed, createEditor, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { body as address } from "~/composables/content/routes";
import { Block } from "~/utils/blocks";
import { toPageBody } from "~/utils/content";
import { failure } from "~/utils/errors";
import { Outline, outline as toOutline } from "~/utils/outline";

/**
 * The editor of what is written on a page: the document as HTML, in and
 * out, with the site's own blocks among its nodes, so a page's cards and
 * its map are kept as they are through an edit, and an id on each heading
 * for the page's table of contents to link to.
 */
const useBodyEditor = createEditor<string, string>("content-body", {
  ...html,
  extensions: [Block, Outline],
});

/** The HTML an editor holds for a record's body: nothing for none. */
const written = (record: ContentRecord): string =>
  record.body === undefined ? "" : toHtml(record.body);

/**
 * What is written on a page, on its own, apart from the form of its
 * metadata. It reads as the page it is until it is clicked, which turns
 * the editor on over it; `editing` says so. `save` writes the document as
 * the tree the site renders, or nothing once the editor is emptied, and
 * `cancel` puts back what was last saved. Either one ends the edit: the
 * document settles and `view` moves on, which the editor is keyed by, so
 * a fresh one draws the body as a page again. A save that fails reports
 * through `error` and leaves the editor open on what was written.
 * `outline` is the page's table of contents as it is written now.
 */
export const useContentBody = (record: ContentRecord) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const editor = useBodyEditor();
  let saved = written(record);
  editor.load(saved);

  const view = ref(0);
  const dirty = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const editing = computed(() => editor.mounted);
  const outline = computed(() => toOutline(editor.json));

  editor.on("updated", () => {
    dirty.value = true;
  });

  const close = () => {
    editor.load(saved);
    dirty.value = false;
    view.value += 1;
  };

  const cancel = () => {
    if (saving.value) return;
    error.value = null;
    close();
  };

  const save = async () => {
    if (saving.value) return;
    error.value = null;
    saving.value = true;
    try {
      const body = contentArticle.parse({
        body: editor.empty ? undefined : toPageBody(fromHtml(editor.document)),
      });
      const answer = await api(address(record.id), { method: "PATCH", body });
      saved = written(contentRecord.parse(answer));
      close();
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      saving.value = false;
    }
  };

  return {
    editor,
    view,
    editing,
    outline,
    dirty,
    saving,
    error,
    save,
    cancel,
  };
};
