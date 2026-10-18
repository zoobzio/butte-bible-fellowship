import { z } from "zod";

import { slug } from "../models/slug";

/** The path of one staff member: `/staff/{slug}`. */
export const staffPath = z.object({
  slug: slug.meta({
    description: "What names them in an address.",
    examples: ["jane-doe"],
  }),
});

/**
 * A staff member as they are written: what creating one takes, and what
 * updating one replaces, every field.
 */
export const staffBody = z
  .object({
    slug: slug.meta({
      description: "What names them in an address.",
      examples: ["jane-doe"],
    }),
    name: z
      .string()
      .min(1)
      .meta({ examples: ["Jane Doe"] }),
    role: z
      .string()
      .min(1)
      .meta({
        description: "What they do.",
        examples: ["Elder"],
      }),
    bio: z.string().optional().meta({
      description: "A few words about them.",
    }),
    photo: z.string().optional().meta({
      description: "The path of their photo, under the site's media.",
    }),
    email: z.email().optional(),
    position: z
      .int()
      .min(0)
      .max(32_767)
      .default(0)
      .meta({
        description: "Where they stand in the list, lowest first.",
        examples: [1],
      }),
  })
  .meta({
    id: "StaffBody",
    description:
      "A staff member as they are written: what creating one takes, and what updating one replaces.",
  });
