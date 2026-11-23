import { z } from "zod";

import { hast } from "../models/hast";
import { personRole } from "../models/person";
import { dayColumn, listingQuery, since, sorting, textColumn } from "./listing";

export const personId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names them to the admin: their row's number.",
      examples: [1],
    }),
});

export const PERSON_SORT_KEYS = [
  "name",
  "role",
  "title",
  "email",
  "phone",
  "birthday",
  "createdAt",
  "updatedAt",
] as const;

export const personSort = z.enum(PERSON_SORT_KEYS).meta({
  description:
    "A column of the people the admin may sort them by. By name is by the last name, then the first.",
  examples: ["name"],
});

export const personQuery = listingQuery.extend({
  ...sorting(personSort),
  roleIs: personRole.optional().meta({
    description: "The role the people listed hold. Left out, every role.",
  }),
  roleNot: personRole.optional().meta({
    description: "A role the people listed do not hold. Left out, none.",
  }),
  ...textColumn("name", "name in full"),
  ...textColumn("title", "title"),
  ...textColumn("email", "email"),
  ...textColumn("phone", "phone"),
  ...textColumn("summary", "summary"),
  ...textColumn("address", "address"),
  ...textColumn("photo", "photo's URL"),
  ...dayColumn("updatedAt", "The day the people listed were last changed"),
  ...dayColumn("createdAt", "The day the people listed were added"),
  since,
});

/**
 * A US phone number as it may be typed: ten digits, the area code in
 * parentheses or not, the parts set apart by spaces, dots or hyphens or
 * not at all, after a +1 or a 1 or neither.
 */
const PHONE = /^(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * A person's phone number as it is written. However it is typed, it is
 * kept one way, as 530-555-0100, so every number reads alike wherever it
 * is shown. A record read back is not held to it: a number written before
 * the rule still loads, and is put right the next time it is saved.
 */
export const personPhone = z
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

export const personBody = z
  .object({
    firstName: z
      .string()
      .min(1)
      .meta({ examples: ["Jane"] }),
    lastName: z
      .string()
      .min(1)
      .meta({ examples: ["Doe"] }),
    role: personRole,
    title: z.string().optional().meta({
      description:
        "What they are called for what they do, which the site shows in place of their role.",
    }),
    summary: z.string().optional().meta({
      description: "A line or two about them, as a card shows.",
    }),
    email: z.email().optional(),
    phone: personPhone.optional(),
    address: z.string().optional().meta({
      description: "Where they live: a line of text to a line of the address.",
    }),
    birthday: z.iso.date().optional().meta({
      description: "The day they were born, as YYYY-MM-DD.",
    }),
  })
  .meta({
    id: "PersonBody",
    description:
      "A person's details as they are written: what creating one takes, and what updating one replaces. Their photo and their bio are each written on their own.",
  });

/** The kinds of image a person's photo may be, by media type. */
export const PERSON_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** The most a person's photo may weigh, in bytes: 4 MB. */
export const PERSON_AVATAR_SIZE = 4 * 1024 * 1024;

/** What is said of a file that cannot be a person's photo. */
const PERSON_AVATAR_ERROR =
  "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.";

export const personAvatar = z
  .file()
  .max(PERSON_AVATAR_SIZE, { error: PERSON_AVATAR_ERROR })
  .mime([...PERSON_AVATAR_TYPES], { error: PERSON_AVATAR_ERROR })
  .meta({
    description:
      "A person's photo as it is uploaded: a JPEG, PNG or WebP image of 4 MB at most.",
  });

export const personForm = personBody
  .extend({
    firstName: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["Jane"] }),
    lastName: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["Doe"] }),
    photo: z.union([z.string(), personAvatar]).optional().meta({
      description:
        "Their photo: the URL of the one they have, or an image picked to be uploaded in its place. Left out, they have none.",
    }),
  })
  .meta({
    description:
      "A person's details as the admin's form holds them: the body, with the names trimmed, and their photo, which is written on its own.",
  });

export const personBio = z
  .object({
    bio: hast.optional().meta({
      description:
        "Their bio in full, as rich text: the tree the admin's editor wrote. Left out, they have none.",
    }),
  })
  .meta({
    id: "PersonBio",
    description:
      "A person's bio as it is written, on its own: what replaces the one they have.",
  });
