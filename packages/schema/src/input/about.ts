import { z } from "zod";

import { hast } from "../models/hast";

export const aboutBody = z
  .object({
    title: z
      .string()
      .min(1)
      .meta({
        description: "The title the page opens with.",
        examples: ["About Us"],
      }),
    description: z.string().optional().meta({
      description: "The line under the title the page opens with.",
    }),
  })
  .meta({
    id: "AboutBody",
    description:
      "About Us's metadata as it is written: the title and the description it opens with. What is written on the page is written on its own.",
  });

export const aboutForm = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().optional(),
  })
  .meta({
    description:
      "About Us's metadata as the admin's form holds it: the body, with its title trimmed.",
  });

export const aboutArticle = z
  .object({
    body: hast.optional().meta({
      description:
        "What is written on the page, as rich text: the tree the admin's editor wrote. Left out, it has none.",
    }),
  })
  .meta({
    id: "AboutArticle",
    description:
      "What is written on About Us, on its own: what replaces what it has.",
  });
