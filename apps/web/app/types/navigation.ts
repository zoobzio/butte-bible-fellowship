import type { AppProsaryMessage } from "#imports";

export interface NavigationLink {
  /** The link's text: a message of `@bbf/prose`, by key. */
  label: AppProsaryMessage;
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
