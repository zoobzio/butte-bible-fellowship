import { z } from "zod";

import { hast } from "./hast";
import { slug } from "./slug";

/** The statuses a piece of content passes through: written, live, kept. */
export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

/**
 * Whether a piece of content reaches the site: a draft is being written, a
 * published one is live, an archived one is kept but no longer shown.
 */
export const contentStatus = z.enum(CONTENT_STATUSES).meta({
  id: "ContentStatus",
  description:
    "Whether it reaches the site: a draft is being written, published is live, archived is kept but no longer shown.",
  examples: ["published"],
});

/** Someone who serves the church, as the site lists them. */
export const staffMember = z
  .object({
    slug: slug.meta({
      description: "What names them in an address: /staff/<slug>.",
      examples: ["jane-doe"],
    }),
    name: z.string().meta({ examples: ["Jane Doe"] }),
    role: z.string().meta({
      description: "What they do.",
      examples: ["Elder", "Pastor", "Office Administrator"],
    }),
    summary: z
      .string()
      .optional()
      .meta({
        description: "A line or two about them, as a card shows.",
        examples: ["Has served as an elder since 2010."],
      }),
    bio: hast.optional().meta({
      description:
        "Their bio in full, for their own page: the tree the app renders, built from the Markdown it was written as.",
    }),
    photo: z
      .url()
      .optional()
      .meta({
        description: "The URL of their photo.",
        examples: ["https://cdn.example.com/staff/jane-doe.jpg"],
      }),
    email: z.email().optional(),
    phone: z
      .string()
      .optional()
      .meta({ examples: ["530-555-0100"] }),
  })
  .meta({
    id: "StaffMember",
    description: "Someone who serves the church, as the site lists them.",
  });

/** The staff the site lists, in their order. */
export const staffMembers = z.array(staffMember).meta({
  description: "The staff the site lists, in their order.",
});
