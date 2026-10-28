import type { Root } from "hast";

import type { Page } from "@bbf/schema/types";

export interface PageItem extends Page {
  body: Root;
}

declare module "hast" {
  interface RootData {
    matter?: Record<string, unknown>;
  }
}
