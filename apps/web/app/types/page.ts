import type { Root } from "hast";

import type { Page } from "@bbf/validators/types";

/**
 * A page of the site, in one locale: its front matter, as the site's pages
 * write it, and its body — the tree `@bbf/i18n` built the page to. Every
 * locale has the same pages.
 */
export interface PageItem extends Page {
  body: Root;
}

declare module "hast" {
  interface RootData {
    /** A page's front matter, as the build's `matter` preset left it on the root. */
    matter?: Record<string, unknown>;
  }
}
