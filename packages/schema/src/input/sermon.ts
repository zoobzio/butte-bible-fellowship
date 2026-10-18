import { z } from "zod";

/** The path of one sermon: `/sermons/{id}`. */
export const sermonPath = z.object({
  id: z
    .string()
    .min(1)
    .meta({
      description: "YouTube's id for the sermon.",
      examples: ["dQw4w9WgXcQ"],
    }),
});

/** The most sermons one request lists. */
export const SERMONS_LIMIT = 50;

/** The query of the sermons list: how many of the newest to take. */
export const sermonsQuery = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SERMONS_LIMIT)
    .default(15)
    .meta({
      description: `How many of the newest sermons to list, up to ${SERMONS_LIMIT}.`,
      examples: [3],
    }),
});
