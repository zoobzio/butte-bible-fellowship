import { z } from "zod";

import { hast } from "../models/hast";
import { contentStatus, staffRole } from "../models/staff";

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
