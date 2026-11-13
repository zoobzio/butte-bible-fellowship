import { z } from "zod";

import { hast } from "./hast";
import { listing } from "./listing";
import { slug } from "./slug";

export const contentRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names it to the admin: its row's number.",
        examples: [1],
      }),
    slug: slug.meta({
      description:
        "What the page is called in its address: /<slug>, and index for the home page.",
      examples: ["about-us"],
    }),
    title: z.string().meta({ examples: ["About Us – Butte Bible Fellowship"] }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
    body: hast.optional().meta({
      description:
        "What is written on the page, as rich text: the tree the app renders, as the admin's editor wrote it, the site's own blocks among its elements.",
    }),
    createdAt: z.iso.datetime().meta({
      description: "When its row was written.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When its row was last changed.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "ContentRecord",
    description:
      "A page of the site, as the admin reads it: every column of its row. Its title and description are what a page's front matter carried.",
  });

export const contentListing = listing(contentRecord).meta({
  id: "ContentListing",
  description: "A page of the site's pages, as the admin lists them: by slug.",
});
