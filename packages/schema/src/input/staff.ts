import { z } from "zod";

import { hast } from "../models/hast";
import { contentStatus, staffRole } from "../models/staff";
import { listingQuery } from "./listing";

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

const day = (what: string) =>
  z.iso
    .date()
    .optional()
    .meta({
      description: `${what}, as YYYY-MM-DD, in the church's own time. Left out, any day.`,
      examples: ["2026-10-17"],
    });

export const staffQuery = listingQuery.extend({
  role: staffRole.optional().meta({
    description: "The role the members listed hold. Left out, every role.",
  }),
  status: contentStatus.optional().meta({
    description:
      "The status the members listed are in. Left out, every status.",
  }),
  updatedAtBefore: day("The day the members listed were last changed before"),
  updatedAtAfter: day("The day the members listed were last changed after"),
  updatedAtOn: day("The day the members listed were last changed on"),
  createdAtBefore: day("The day the members listed were added before"),
  createdAtAfter: day("The day the members listed were added after"),
  createdAtOn: day("The day the members listed were added on"),
});

export const staffBody = z
  .object({
    name: z
      .string()
      .min(1)
      .meta({ examples: ["Jane Doe"] }),
    role: staffRole,
    summary: z.string().optional().meta({
      description: "A line or two about them, as a card shows.",
    }),
    bio: hast.optional().meta({
      description:
        "Their bio in full, as rich text: the tree the admin's editor wrote.",
    }),
    photo: z.url().optional().meta({
      description: "The URL of their photo.",
    }),
    email: z.email().optional(),
    phone: z
      .string()
      .optional()
      .meta({ examples: ["530-555-0100"] }),
    status: contentStatus.default("draft").meta({
      description: "Whether they reach the site. Left out, a draft.",
    }),
  })
  .meta({
    id: "StaffBody",
    description:
      "A staff member as they are written: what creating one takes, and what updating one replaces.",
  });

export const staffForm = staffBody
  .omit({ bio: true })
  .extend({
    name: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["Jane Doe"] }),
    bio: z.string().optional().meta({
      description: "Their bio in full, as the HTML the admin's editor holds.",
    }),
  })
  .meta({
    description:
      "A staff member as the admin's form holds them: the body, with the bio as HTML and the name trimmed.",
  });
