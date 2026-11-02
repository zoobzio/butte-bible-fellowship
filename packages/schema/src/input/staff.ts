import { z } from "zod";

import { hast } from "../models/hast";
import { contentStatus, staffRole } from "../models/staff";
import { listingQuery, sorting } from "./listing";

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

const text = (what: string) =>
  z
    .string()
    .min(1)
    .optional()
    .meta({
      description: `${what}, as typed, without regard to case. Left out, any.`,
    });

/**
 * The filters on a text column: the value it holds or not, whatever the
 * case, or `present` or `missing` for whether it is filled in; and the
 * text it carries, does not carry, starts with or ends with, as typed.
 */
const textColumn = <K extends string>(key: K, what: string) =>
  ({
    [`${key}Is`]: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: `The ${what} the members listed hold, without regard to case, or present or missing for whether they have one. Left out, any.`,
        examples: ["missing"],
      }),
    [`${key}Not`]: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: `A ${what} the members listed do not hold, without regard to case, or present or missing for whether they lack one. Left out, none.`,
        examples: ["present"],
      }),
    [`${key}Contains`]: text(`Text the ${what} must carry`),
    [`${key}NotContains`]: text(`Text the ${what} must not carry`),
    [`${key}StartsWith`]: text(`Text the ${what} must start with`),
    [`${key}EndsWith`]: text(`Text the ${what} must end with`),
  }) as Record<
    `${K}${"Is" | "Not" | "Contains" | "NotContains" | "StartsWith" | "EndsWith"}`,
    ReturnType<typeof text>
  >;

/**
 * The filters on a day column: the day before, after, on, on or after, or
 * on or before which the members listed were changed or added.
 */
const dayColumn = <K extends string>(key: K, what: string) =>
  ({
    [`${key}Before`]: day(`${what} before`),
    [`${key}After`]: day(`${what} after`),
    [`${key}On`]: day(`${what} on`),
    [`${key}OnOrAfter`]: day(`${what} on or after`),
    [`${key}OnOrBefore`]: day(`${what} on or before`),
  }) as Record<
    `${K}${"Before" | "After" | "On" | "OnOrAfter" | "OnOrBefore"}`,
    ReturnType<typeof day>
  >;

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
