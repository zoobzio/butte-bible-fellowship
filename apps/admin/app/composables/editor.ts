import { reactive, ref, toRaw, useNuxtApp, useRouter } from "#imports";
import { failure } from "~/utils/errors";

export interface EditorRemoval {
  confirm: string;
  run: () => Promise<unknown>;
}

export interface EditorOptions<D extends object, B> {
  draft: D;
  body: (draft: D) => B;
  save: (body: B) => Promise<unknown>;
  remove?: EditorRemoval;
  back: string;
}

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
