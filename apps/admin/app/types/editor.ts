import type { AppProsaryMessage, Ref, UseForm } from "#imports";

/**
 * A value a field offers, named by a message.
 */
export interface Choice<T extends string> {
  value: T;
  label: AppProsaryMessage;
}

/**
 * A choice named for the reader: what a select lists.
 */
export interface Option<T extends string = string> {
  value: T;
  label: string;
}

/**
 * One part of a record being edited, as the bar that saves the whole record
 * sees it: `dirty` while it holds a change not yet saved, `open` while there
 * is anything to put back, a change or an editor left open, and `saving`
 * while its save is under way. `save` writes the part and reports what
 * fails through `error`, never by throwing; `reset` puts back what was last
 * saved.
 */
export interface Draft {
  dirty: Readonly<Ref<boolean>>;
  open: Readonly<Ref<boolean>>;
  saving: Readonly<Ref<boolean>>;
  error: Readonly<Ref<string | null>>;
  save: () => Promise<void>;
  reset: () => void;
}

/**
 * The form of a page's metadata, as the panel that draws it takes it: the
 * form itself, and what of it the bar that saves the whole page reads.
 */
export interface Metadata<T> {
  form: ReturnType<UseForm<T>>;
  error: Readonly<Ref<string | null>>;
  dirty: Readonly<Ref<boolean>>;
  saving: Readonly<Ref<boolean>>;
  save: () => Promise<void>;
  reset: () => void;
}
