import { z } from "zod";

/**
 * The mark a list is read at: what to ask it with later, as `since`, for
 * whether it still stands.
 */
export const mark = z
  .string()
  .optional()
  .meta({
    description:
      "The mark the list is read at: what to ask with next, as since, to be answered only where something was added, changed or removed.",
    examples: ["42"],
  });

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
