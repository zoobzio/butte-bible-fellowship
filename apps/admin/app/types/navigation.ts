import type { AppProsaryMessage } from "#imports";
import type { IconAlias } from "@zoobzio/nuxt/types/icon";

export interface SidebarLink {
  label: AppProsaryMessage;
  to: string;
}

export interface SidebarConfig {
  links: SidebarLink[];
}

/**
 * A link of a page's header, named, with an icon before its name when it
 * has one: the way back to the page above, or a tab to one page of the
 * record.
 */
export interface PageLink {
  label: string;
  to: string;
  icon?: IconAlias;
}
