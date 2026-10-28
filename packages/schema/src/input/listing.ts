import { z } from "zod";

export const LISTING_MAX_SIZE = 100;

export const LISTING_DEFAULT_SIZE = 25;

export const listingQuery = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({
      description: "Which page, counted from one. Left out, the first.",
      examples: [1],
    }),
  size: z.coerce
    .number()
    .int()
    .min(1)
    .max(LISTING_MAX_SIZE)
    .default(LISTING_DEFAULT_SIZE)
    .meta({
      description: "How many items to a page. Left out, twenty-five.",
      examples: [25],
    }),
});
