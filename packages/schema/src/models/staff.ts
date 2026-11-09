import { z } from "zod";

import { hast } from "./hast";
import { listing } from "./listing";

export const STAFF_ROLES = ["pastor", "elder", "staff"] as const;

export const staffRole = z.enum(STAFF_ROLES).meta({
  id: "StaffRole",
  description:
    "What they do, in the order the site lists them: the pastor, then the elders, then the staff.",
  examples: ["elder"],
});

const identity = z
  .int()
  .positive()
  .meta({
    description: "What names them: their row's number.",
    examples: [1],
  });

const bio = hast.optional().meta({
  description:
    "Their bio in full, as rich text: the tree the app renders, as the admin's editor wrote it.",
});

export const staffMember = z
  .object({
    id: identity,
    name: z.string().meta({ examples: ["Jane Doe"] }),
    role: staffRole,
    summary: z
      .string()
      .optional()
      .meta({
        description: "A line or two about them, as a card shows.",
        examples: ["Has served as an elder since 2010."],
      }),
    bio,
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
  description:
    "The staff the site lists, in their order: by role, then by name.",
});

export const staffRecord = z
  .object({
    id: identity,
    name: z.string().meta({ examples: ["Jane Doe"] }),
    role: staffRole,
    summary: z.string().optional().meta({
      description: "A line or two about them, as a card shows.",
    }),
    bio,
    photo: z.url().optional().meta({
      description: "The URL of their photo.",
    }),
    email: z.email().optional(),
    phone: z
      .string()
      .optional()
      .meta({ examples: ["530-555-0100"] }),
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
      "Someone who serves the church, as the admin reads them: every column of their row.",
  });

export const staffListing = listing(staffRecord).meta({
  id: "StaffListing",
  description: "A page of the staff, as the admin lists them, in their order.",
});
