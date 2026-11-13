import type { InjectionKey } from "#imports";

import type { Draft } from "~/types/editor";

import {
  computed,
  inject,
  onScopeDispose,
  provide,
  shallowReactive,
} from "#imports";

/** The parts of the record a page edits, as the panels under it hand them in. */
const DRAFTS: InjectionKey<Set<Draft>> = Symbol("drafts");

/**
 * The parts of one record, saved and reset as a whole: a page calls this,
 * and each panel under it hands in its own part with `useDraft`. `dirty`,
 * `open` and `saving` hold while any part does, and `errors` is what each
 * part's last save said went wrong. `save` writes every part with a change,
 * each in its own request, and leaves the rest alone; `reset` puts every
 * part back as it was last saved. Neither runs under a save.
 */
export const useDrafts = () => {
  const parts = shallowReactive(new Set<Draft>());
  provide(DRAFTS, parts);

  const dirty = computed(() => [...parts].some((part) => part.dirty.value));
  const open = computed(() => [...parts].some((part) => part.open.value));
  const saving = computed(() => [...parts].some((part) => part.saving.value));
  const errors = computed(() =>
    [...parts].flatMap((part) => part.error.value ?? []),
  );

  const save = async () => {
    if (saving.value) return;
    const changed = [...parts].filter((part) => part.dirty.value);
    await Promise.all(changed.map((part) => part.save()));
  };

  const reset = () => {
    if (saving.value) return;
    for (const part of parts) part.reset();
  };

  return { dirty, open, saving, errors, save, reset };
};

/**
 * Hands a part of a record to the page that saves the whole of it, for as
 * long as the panel is drawn. It answers whether there is such a page: a
 * panel on its own, in a dialog, keeps a save button of its own.
 */
export const useDraft = (draft: Draft): boolean => {
  const parts = inject(DRAFTS, null);
  if (parts === null) return false;
  parts.add(draft);
  onScopeDispose(() => parts.delete(draft));
  return true;
};
