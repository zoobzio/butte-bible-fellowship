import type { AppProsaryMessage } from "#imports";

/**
 * A link of the header's navigation, as an app's `app.config.ts` names it:
 * the key of the message that names it, and where it leads.
 */
export interface NavigationLink {
  label: AppProsaryMessage;
  to: string;
}

/**
 * A link of the header's navigation as it renders: named in the reader's
 * language, and marked while its page, or a page under it, is read.
 */
export interface NavigationItem {
  label: string;
  to: string;
  active: boolean;
}

/**
 * The header, as an app's `app.config.ts` sets it: the line under the
 * church's name, and the links of its navigation, in order.
 */
export interface HeaderConfig {
  tagline: AppProsaryMessage;
  links: NavigationLink[];
}
