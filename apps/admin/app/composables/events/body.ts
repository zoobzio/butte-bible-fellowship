import type { EventRecord } from "@bbf/schema/types";

import { eventArticle, eventRecord } from "@bbf/schema";
import { fromHtml, toHtml } from "@bbf/utils/vm";
import { html } from "@zoobzio/editor";
import { computed, createEditor, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { body as address } from "~/composables/events/routes";
import { failure } from "~/utils/errors";

/** The editor of what is written about an event: the document as HTML, in and out. */
const useBodyEditor = createEditor<string, string>("event-body", html);

/** The HTML an editor holds for a record's body: nothing for none. */
const written = (record: EventRecord): string =>
  record.body === undefined ? "" : toHtml(record.body);

/**
 * What is written about an event, on its own, apart from the form of its
 * details. It reads as the page it is until it is clicked, which turns the
 * editor on over it; `editing` says so. `save` writes the document as the
 * tree the site renders, or nothing once the editor is emptied, and
 * `cancel` puts back what was last saved. Either one ends the edit: the
 * document settles and `view` moves on, which the editor is keyed by, so
 * a fresh one draws the body as a page again. A save that fails reports
 * through `error` and leaves the editor open on what was written.
 */
export const useEventBody = (record: EventRecord) => {
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
      const body = eventArticle.parse({
        body: editor.empty ? undefined : fromHtml(editor.document),
      });
      const answer = await api(address(record.id), { method: "PATCH", body });
      saved = written(eventRecord.parse(answer));
      close();
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      saving.value = false;
    }
  };

  return { editor, view, editing, dirty, saving, error, save, cancel };
};
