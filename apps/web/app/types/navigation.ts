import type { AppFibberMessage } from "#imports";

export interface NavigationLink {
  /** The link's text: a message of `@bbf/i18n`, by key. */
  label: AppFibberMessage;
  to: string;
}
