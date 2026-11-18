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
 * What the control of a picture says of what it does, under the pointer
 * and to a reader: `upload` and `change` for the badge that picks an
 * image, with none and with one to take the place of, `remove` for the
 * badge that removes it, and `none` for what stands in for no picture,
 * where that is to be said.
 */
export interface PictureLabels {
  upload: string;
  change: string;
  remove: string;
  none?: string;
}

/**
 * What a save asks of the server for a picture, where the picture is
 * written: an upload, a form with the image as its file, or a removal.
 */
export type ImageRequest =
  | { method: "PATCH"; body: FormData }
  | { method: "DELETE" };

/**
 * The form of a page's metadata, as the panel that draws it takes it: the
 * form itself, and what of it the bar that saves the whole page reads. `picture` is what
 * the control of the page's picture says, for a page that has one.
 */
export interface Metadata<T> {
  form: ReturnType<UseForm<T>>;
  picture?: PictureLabels;
  error: Readonly<Ref<string | null>>;
  dirty: Readonly<Ref<boolean>>;
  saving: Readonly<Ref<boolean>>;
  save: () => Promise<void>;
  reset: () => void;
}
