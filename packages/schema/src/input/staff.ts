import { z } from "zod";

import { slug } from "../models/slug";
import { contentStatus } from "../models/staff";

export const staffPath = z.object({
  slug: slug.meta({
    description: "What names them in an address.",
    examples: ["jane-doe"],
  }),
});

export const staffId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names them to the admin: their row's number.",
      examples: [1],
    }),
});

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
    summary: z.string().optional().meta({
      description: "A line or two about them, as a card shows.",
    }),
    bio: z.string().optional().meta({
      description: "Their bio in full, as Markdown, for their own page.",
    }),
    photo: z.url().optional().meta({
      description: "The URL of their photo.",
    }),
    email: z.email().optional(),
    phone: z
      .string()
      .optional()
      .meta({ examples: ["530-555-0100"] }),
    position: z
      .int()
      .min(0)
      .max(32_767)
      .default(0)
      .meta({
        description: "Where they stand in the list, lowest first.",
        examples: [1],
      }),
    status: contentStatus.default("draft").meta({
      description: "Whether they reach the site. Left out, a draft.",
    }),
  })
  .meta({
    id: "StaffBody",
    description:
      "A staff member as they are written: what creating one takes, and what updating one replaces.",
  });
