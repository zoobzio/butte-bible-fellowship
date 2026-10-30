import { z } from "zod";

export const LISTING_MAX_SIZE = 100;

export const LISTING_DEFAULT_SIZE = 25;

export const SORT_DIRECTIONS = ["asc", "desc"] as const;

export const sortDirection = z.enum(SORT_DIRECTIONS).meta({
  description: "Which way a listing is sorted: ascending or descending.",
});

/**
 * The sort a listing takes, over the columns `field` names: the column,
 * and the direction. Left out, the listing is in its own order, and a
 * column named without a direction is ascending.
 */
export const sorting = <T extends z.ZodType<string>>(field: T) => ({
  sort: field.optional().meta({
    description:
      "The column the items are sorted by. Left out, the items are in their own order.",
  }),
  direction: sortDirection.optional().meta({
    description: "Which way the items are sorted. Left out, ascending.",
    examples: ["asc"],
  }),
});

export const PRESENCES = ["present", "missing"] as const;

/**
 * Whether an optional column of a record is filled in: a listing narrows
 * to the records that have it, or to the ones that lack it.
 */
export const presence = z.enum(PRESENCES).meta({
  description:
    "Whether the column is filled in: present narrows to the items that have it, missing to the ones that lack it.",
  examples: ["missing"],
});

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
  q: z
    .string()
    .trim()
    .optional()
    .meta({
      description:
        "Free text the items are searched for, without regard to case. Left out or empty, every item.",
      examples: ["jane"],
    }),
});
