import type { AppProsaryMessage } from "#imports";

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
