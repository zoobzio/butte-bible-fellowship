import type { StaffRecord } from "@bbf/schema/types";

import { staffBio, staffRecord } from "@bbf/schema";
import { fromHtml, toHtml } from "@bbf/utils/vm";
import { html } from "@zoobzio/editor";
import { computed, createEditor, ref, useNuxtApp } from "#imports";
import { useApi } from "~/composables/api";
import { bio } from "~/composables/staff/routes";
import { failure } from "~/utils/errors";
import { Outline, outline as toOutline } from "~/utils/outline";

/**
 * The editor of a member's bio: the document as HTML, in and out, with an
 * id on each heading for its table of contents to link to.
 */
const useBioEditor = createEditor<string, string>("staff-bio", {
  ...html,
  extensions: [Outline],
});

/** The HTML an editor holds for a record's bio: nothing for none. */
const written = (record: StaffRecord): string =>
  record.bio === undefined ? "" : toHtml(record.bio);

/**
 * A member's bio, written on its own, apart from the form of their
 * details. It reads as the page it is until it is clicked, which turns
 * the editor on over it; `editing` says so. `save` writes the document as
 * the tree the site renders, or no bio once the editor is emptied, and
 * `cancel` puts back what was last saved. Either one ends the edit: the
 * document settles and `view` moves on, which the editor is keyed by, so
 * a fresh one draws the bio as a page again. A save that fails reports
 * through `error` and leaves the editor open on what was written.
 * `outline` is the bio's table of contents as it is written now.
 */
export const useStaffBio = (record: StaffRecord) => {
  const api = useApi();
  const { $t } = useNuxtApp();

  const editor = useBioEditor();
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
      const body = staffBio.parse({
        bio: editor.empty ? undefined : fromHtml(editor.document),
      });
      const answer = await api(bio(record.id), { method: "PATCH", body });
      saved = written(staffRecord.parse(answer));
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
