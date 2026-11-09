import { z } from "zod";

import { hast } from "../models/hast";
import { staffRole } from "../models/staff";
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
  ...textColumn("name", "name"),
  ...textColumn("email", "email"),
  ...textColumn("phone", "phone"),
  ...textColumn("summary", "summary"),
  ...textColumn("photo", "photo's URL"),
  ...dayColumn("updatedAt", "The day the members listed were last changed"),
  ...dayColumn("createdAt", "The day the members listed were added"),
});

/**
 * A US phone number as it may be typed: ten digits, the area code in
 * parentheses or not, the parts set apart by spaces, dots or hyphens or
 * not at all, after a +1 or a 1 or neither.
 */
const PHONE = /^(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * A member's phone number as it is written. However it is typed, it is
 * kept one way, as 530-555-0100, so every number reads alike wherever it
 * is shown. A record read back is not held to it: a number written before
 * the rule still loads, and is put right the next time it is saved.
 */
export const staffPhone = z
  .string()
  .trim()
  .regex(PHONE, "Invalid phone number: ten digits, like 530-555-0100")
  .transform((value) => {
    const digits = value.replace(/\D/g, "").slice(-10);
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  })
  .meta({
    description:
      "Their phone number: ten digits, however they are set apart. It is kept as 530-555-0100.",
    examples: ["530-555-0100"],
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
    email: z.email().optional(),
    phone: staffPhone.optional(),
  })
  .meta({
    id: "StaffBody",
    description:
      "A staff member's details as they are written: what creating one takes, and what updating one replaces. Their photo and their bio are each written on their own.",
  });

export const staffForm = staffBody
  .extend({
    name: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["Jane Doe"] }),
  })
  .meta({
    description:
      "A staff member's details as the admin's form holds them: the body, with the name trimmed.",
  });

export const staffBio = z
  .object({
    bio: hast.optional().meta({
      description:
        "Their bio in full, as rich text: the tree the admin's editor wrote. Left out, they have none.",
    }),
  })
  .meta({
    id: "StaffBio",
    description:
      "A staff member's bio as it is written, on its own: what replaces the one they have.",
  });

/** The kinds of image a member's photo may be, by media type. */
export const STAFF_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** The most a member's photo may weigh, in bytes: 4 MB. */
export const STAFF_AVATAR_SIZE = 4 * 1024 * 1024;

export const staffAvatar = z
  .file()
  .max(STAFF_AVATAR_SIZE)
  .mime([...STAFF_AVATAR_TYPES])
  .meta({
    description:
      "A staff member's photo as it is uploaded: a JPEG, PNG or WebP image of 4 MB at most.",
  });
