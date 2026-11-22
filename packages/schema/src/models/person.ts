import { z } from "zod";

import { hast } from "./hast";
import { listing } from "./listing";

export const PERSON_ROLES = ["pastor", "elder", "staff", "member"] as const;

export const personRole = z.enum(PERSON_ROLES).meta({
  id: "PersonRole",
  description:
    "What they are to the church, in the order they are listed: the pastor, then the elders, then the staff, who serve it and are whom the site lists, and then the members, who belong to it and are the admin's alone to read. A person is a member until given another role.",
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
    role: personRole,
    title: z
      .string()
      .optional()
      .meta({
        description:
          "What they are called for what they do, which the site shows in place of their role.",
        examples: ["Worship Director"],
      }),
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
    "The staff the site lists, who are the people who serve the church, in their order: by role, then by last name.",
});

export const personRecord = z
  .object({
    id: identity,
    firstName: z.string().meta({ examples: ["Jane"] }),
    lastName: z.string().meta({
      description:
        "Their last name. Empty for a name written as one before its parts were kept apart, until it is written.",
      examples: ["Doe"],
    }),
    name: z.string().meta({
      description: "Their name in full: the first, then the last.",
      examples: ["Jane Doe"],
    }),
    role: personRole,
    title: z
      .string()
      .optional()
      .meta({
        description:
          "What they are called for what they do, which the site shows in place of their role.",
        examples: ["Worship Director"],
      }),
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
    address: z
      .string()
      .optional()
      .meta({
        description:
          "Where they live: a line of text to a line of the address.",
        examples: ["123 Main St\nButte, MT 59701"],
      }),
    birthday: z.iso
      .date()
      .optional()
      .meta({
        description: "The day they were born, as YYYY-MM-DD.",
        examples: ["1980-04-12"],
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
    id: "PersonRecord",
    description:
      "Someone of the church, whether they serve it or belong to it, as the admin reads them: every column of their row.",
  });

export const personListing = listing(personRecord).meta({
  id: "PersonListing",
  description: "A page of the people, as the admin lists them, in their order.",
});
