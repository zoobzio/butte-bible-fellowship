import { z } from "zod";

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
