import { z } from "zod";

import { hast } from "./hast";
import { page } from "./page";

const address = z.string().meta({
  description:
    "The church's street address, in full: the page's map is drawn from it.",
  examples: ["2255 Pillsbury Road, Chico, California 95926"],
});

const phone = z
  .string()
  .optional()
  .meta({
    description: "The church's phone number.",
    examples: ["530-892-0521"],
  });

const fax = z
  .string()
  .optional()
  .meta({
    description: "The church's fax number.",
    examples: ["530-898-1851"],
  });

const email = z
  .string()
  .optional()
  .meta({
    description: "The church's email address.",
    examples: ["office@bbfchurchchico.org"],
  });

const hours = z
  .string()
  .optional()
  .meta({
    description:
      "The hours the church's office keeps: a line of text to a line of the page.",
    examples: ["Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon"],
  });

export const connectPage = page
  .pick({ title: true, description: true })
  .extend({ address, phone, fax, email, hours })
  .meta({
    id: "ConnectPage",
    description:
      "The connect page's front matter, as the site reads it: its title and description, and how to find and reach the church.",
  });

export const connectRecord = z
  .object({
    title: z.string().meta({
      description:
        "The title the page opens with, which the browser's tab and search engines show too.",
      examples: ["Connect"],
    }),
    description: z.string().optional().meta({
      description:
        "The line under the title the page opens with, which search engines show too.",
    }),
    address,
    phone,
    fax,
    email,
    hours,
    body: hast.optional().meta({
      description:
        "What is written on the page, under its header, as rich text: the tree the app renders, as the admin's editor wrote it.",
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When the page was last changed.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "ConnectRecord",
    description:
      "The connect page, as the admin reads it: every column of its one row.",
  });
