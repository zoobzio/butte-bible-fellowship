import { z } from "zod";

import { hast } from "./hast";
import { listing } from "./listing";
import { slug } from "./slug";

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;

export const contentStatus = z.enum(CONTENT_STATUSES).meta({
  id: "ContentStatus",
  description:
    "Whether it reaches the site: a draft is being written, published is live, archived is kept but no longer shown.",
  examples: ["published"],
});

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

export const staffMembers = z.array(staffMember).meta({
  description: "The staff the site lists, in their order.",
});

export const staffRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names them to the admin: their row's number.",
        examples: [1],
      }),
    slug: slug.meta({
      description: "What names them in an address: /staff/<slug>.",
      examples: ["jane-doe"],
    }),
    name: z.string().meta({ examples: ["Jane Doe"] }),
    role: z.string().meta({
      description: "What they do.",
      examples: ["Elder", "Pastor", "Office Administrator"],
    }),
    summary: z.string().optional().meta({
      description: "A line or two about them, as a card shows.",
    }),
    bio: z.string().optional().meta({
      description: "Their bio in full, as Markdown, as it was written.",
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
      .meta({
        description: "Where they stand in the list, lowest first.",
        examples: [1],
      }),
    status: contentStatus.meta({
      description: "Whether they reach the site.",
    }),
    createdAt: z.iso.datetime().meta({
      description: "When their row was written.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When their row was last changed.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "StaffRecord",
    description:
      "Someone who serves the church, as the admin reads them: every column of their row, whatever their status.",
  });

export const staffListing = listing(staffRecord).meta({
  id: "StaffListing",
  description:
    "A page of the staff, as the admin lists them: in their order, whatever their status.",
});
