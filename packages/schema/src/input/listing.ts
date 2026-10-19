import { z } from "zod";

/** The most items one page of a listing holds. */
export const LISTING_MAX_SIZE = 100;

/** The items a page of a listing holds when the query names no size. */
export const LISTING_DEFAULT_SIZE = 25;

/**
 * The query of a listing: which page, counted from one, and how many items
 * to a page. Left out, the first page of twenty-five.
 */
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
