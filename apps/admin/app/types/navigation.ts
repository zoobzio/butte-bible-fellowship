import type { IconAlias } from "@zoobzio/nuxt/types/icon";
import type { AppProsaryMessage } from "#imports";

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

/**
 * One of the site's own pages, as the admin lists it and heads its editor:
 * the messages that name it and say what of it is changed here, and where
 * its editor is.
 */
export interface SitePageLink {
  label: AppProsaryMessage;
  description: AppProsaryMessage;
  to: string;
}
