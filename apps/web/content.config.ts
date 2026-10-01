import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        hero: z
          .object({
            tagline: z.string(),
            highlight: z.string().optional(),
            description: z.string().optional(),
            cta: z
              .object({
                label: z.string(),
                to: z.string(),
              })
              .optional(),
          })
          .optional(),
      }),
    }),
  },
});
