import { z } from "zod";

/**
 * A page of a list, as the admin's APIs answer with one: the items the page
 * holds, and how many there are in all, so a table can say how many pages
 * there are. What a kind's `listing` schema is built from.
 */
export const listing = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item).meta({ description: "The items on this page." }),
    total: z
      .int()
      .min(0)
      .meta({
        description: "How many items there are in all, every page counted.",
        examples: [42],
      }),
  });
