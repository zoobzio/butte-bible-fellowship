import type { Root } from "hast";

import type { Page } from "@bbf/schema/types";

/**
 * A page as a component reads it: its front matter, a page's own or the
 * more a page with a layout of its own carries, beside what is written on
 * it.
 */
export type PageItem<Matter = Page> = Matter & { body: Root };

declare module "hast" {
  interface RootData {
    matter?: Record<string, unknown>;
  }
}
