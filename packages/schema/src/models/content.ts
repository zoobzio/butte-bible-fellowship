import { z } from "zod";

import { hast } from "./hast";
import { slug } from "./slug";

/**
 * The media type of an article: the site's own, for the tree the admin's
 * editor writes. It is what a document is made as when nothing names
 * another, as the database has it.
 */
export const ARTICLE_MIME = "application/vnd.bbf.article+json";

export const mime = z
  .string()
  .regex(/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/)
  .meta({
    id: "Mime",
    description:
      "A media type (a MIME type), lowercase and without parameters, as a document would be served: what kind of document it is. An article is the site's own, application/vnd.bbf.article+json.",
    examples: [ARTICLE_MIME, "image/png", "application/pdf"],
  });

/** How much a document, or all that is under a folder, holds: its bytes. */
export const documentSize = z
  .int()
  .min(0)
  .meta({ examples: [2048] });

export const contentRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names it to the admin: its row's number.",
        examples: [1],
      }),
    folder: z
      .int()
      .positive()
      .optional()
      .meta({
        description:
          "The folder it is filed in, by its id. Left out, it is at the top, in no folder.",
        examples: [1],
      }),
    mime,
    slug: slug.meta({
      description: "What the page is called in its address: /<slug>.",
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
    size: documentSize.meta({
      description:
        "How much it holds, in bytes: of an article, what is written on it, none when nothing is.",
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
      "A page written in the admin, as the admin reads it: every column of its row. Its title and description are what a page's front matter carried.",
  });

export const contentRecords = z.array(contentRecord).meta({
  id: "ContentRecords",
  description:
    "The pages filed in one folder, or at the top, as the admin lists them: by title.",
});
