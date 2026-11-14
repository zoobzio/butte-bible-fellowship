import { z } from "zod";

import { hast } from "./hast";

export const aboutRecord = z
  .object({
    title: z.string().meta({
      description:
        "The title the page opens with, which the browser's tab and search engines show too.",
      examples: ["About Us"],
    }),
    description: z.string().optional().meta({
      description:
        "The line under the title the page opens with, which search engines show too.",
    }),
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
    id: "AboutRecord",
    description:
      "About Us, as the admin reads it: every column of its one row.",
  });
