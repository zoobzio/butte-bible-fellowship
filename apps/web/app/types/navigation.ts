import type { AppFibberMessage } from "#imports";

export interface NavigationLink {
  /** The link's text: a message of `@bbf/i18n`, by key. */
  label: AppFibberMessage;
  to: string;
}

/** A link as the navigation sets it: its words, where it leads, and whether the reader is there. */
export interface NavigationItem {
  label: string;
  /** Where the link leads, in the reader's locale. */
  to: string;
  /** Whether the page being read is the link's own page or one under it. */
  active: boolean;
}
