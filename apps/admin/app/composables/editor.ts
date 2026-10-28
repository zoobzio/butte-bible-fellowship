import { reactive, ref, toRaw, useNuxtApp, useRouter } from "#imports";
import { failure } from "~/utils/errors";

/** The deletion of a record: what to ask first, and what deletes it once told yes. */
export interface EditorRemoval {
  confirm: string;
  run: () => Promise<unknown>;
}

export interface EditorOptions<D extends object, B> {
  /** What the editor's controls hold, as it opens. */
  draft: D;
  /** The body the draft is written as, or a throw naming what is wrong with it. */
  body: (draft: D) => B;
  /** Writes the body, new or over the record. */
  save: (body: B) => Promise<unknown>;
  /** Deletes the record, once asked. Left out, the editor offers no delete. */
  remove?: EditorRemoval;
  /** Where to go once the record is saved or deleted. */
  back: string;
}

/**
 * An editor over a record: its draft, for the controls to bind to; `submit`,
 * which builds the body and saves it, then leaves for the list, or keeps
 * the editor open with what went wrong — in the error's words, or the
 * editor's own when it has none; and `destroy`, which asks, deletes, and
 * leaves the same way. `saving` and `removing` say which is under way, so
 * the controls can wait.
 */
export const useEditor = <D extends object, B>(
  options: EditorOptions<D, B>,
) => {
  const router = useRouter();
  const { $t } = useNuxtApp();

  const draft = reactive(options.draft) as D;
  const saving = ref(false);
  const removing = ref(false);
  const error = ref<string | null>(null);
  const removable = options.remove !== undefined;

  const run = async (busy: typeof saving, work: () => Promise<unknown>) => {
    if (saving.value || removing.value) return;
    error.value = null;
    busy.value = true;
    try {
      await work();
      await router.push(options.back);
    } catch (caught) {
      error.value = failure(caught) ?? $t.admin.editor.failed();
    } finally {
      busy.value = false;
    }
  };

  const submit = () =>
    run(saving, () => options.save(options.body(toRaw(draft))));

  const destroy = async () => {
    if (!options.remove) return;
    if (!globalThis.confirm(options.remove.confirm)) return;
    await run(removing, options.remove.run);
  };

  return { draft, saving, removing, error, removable, submit, destroy };
};
