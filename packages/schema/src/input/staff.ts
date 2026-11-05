import { z } from "zod";

import { hast } from "../models/hast";
import { contentStatus, staffRole } from "../models/staff";
import { dayColumn, listingQuery, sorting, textColumn } from "./listing";

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

export const STAFF_SORT_KEYS = [
  "name",
  "role",
  "status",
  "email",
  "phone",
  "createdAt",
  "updatedAt",
] as const;

export const staffSort = z.enum(STAFF_SORT_KEYS).meta({
  description: "A column of the staff the admin may sort them by.",
  examples: ["name"],
});

export const staffQuery = listingQuery.extend({
  ...sorting(staffSort),
  roleIs: staffRole.optional().meta({
    description: "The role the members listed hold. Left out, every role.",
  }),
  roleNot: staffRole.optional().meta({
    description: "A role the members listed do not hold. Left out, none.",
  }),
  statusIs: contentStatus.optional().meta({
    description:
      "The status the members listed are in. Left out, every status.",
  }),
  statusNot: contentStatus.optional().meta({
    description: "A status the members listed are not in. Left out, none.",
  }),
  ...textColumn("name", "name"),
  ...textColumn("email", "email"),
  ...textColumn("phone", "phone"),
  ...textColumn("summary", "summary"),
  ...textColumn("photo", "photo's URL"),
  ...dayColumn("updatedAt", "The day the members listed were last changed"),
  ...dayColumn("createdAt", "The day the members listed were added"),
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
