import { z } from "zod";

import { hast } from "../models/hast";

/** A line of the page that may be left out. */
const line = z.string().optional();

export const connectBody = z
  .object({
    title: z
      .string()
      .min(1)
      .meta({
        description: "The title the page opens with.",
        examples: ["Connect"],
      }),
    description: line.meta({
      description: "The line under the title the page opens with.",
    }),
    address: z
      .string()
      .min(1)
      .meta({
        description:
          "The church's street address, in full: the page's map is drawn from it.",
        examples: ["2255 Pillsbury Road, Chico, California 95926"],
      }),
    phone: line.meta({
      description: "The church's phone number.",
      examples: ["530-892-0521"],
    }),
    fax: line.meta({
      description: "The church's fax number.",
      examples: ["530-898-1851"],
    }),
    email: line.meta({
      description: "The church's email address.",
      examples: ["office@bbfchurchchico.org"],
    }),
    hours: line.meta({
      description:
        "The hours the church's office keeps: a line of text to a line of the page.",
      examples: ["Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon"],
    }),
  })
  .meta({
    id: "ConnectBody",
    description:
      "The connect page's metadata as it is written: the title and the description it opens with, and how to find and reach the church. What is written on the page is written on its own.",
  });

export const connectForm = z
  .object({
    title: z.string().trim().min(1),
    description: line,
    address: z.string().trim().min(1),
    phone: line,
    fax: line,
    email: line,
    hours: line,
  })
  .meta({
    description:
      "The connect page's metadata as the admin's form holds it: the body, with its title and address trimmed.",
  });

export const connectArticle = z
  .object({
    body: hast.optional().meta({
      description:
        "What is written on the page, as rich text: the tree the admin's editor wrote. Left out, it has none.",
    }),
  })
  .meta({
    id: "ConnectArticle",
    description:
      "What is written on the connect page, on its own: what replaces what it has.",
  });
