import { z } from "zod";

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

export const contentStatus = z.enum(CONTENT_STATUSES).meta({
  id: "ContentStatus",
  description:
    "Whether it reaches the site: a draft is being written, published is live, archived is kept but no longer shown.",
  examples: ["published"],
});
