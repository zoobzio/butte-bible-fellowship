import { z } from "zod";

import { hast } from "../models/hast";
import { slug } from "../models/slug";
import { dayColumn, listingQuery, sorting, textColumn } from "./listing";

export const contentPath = z.object({
  slug: slug.meta({
    description: "What the page is called in its address.",
    examples: ["about-us"],
  }),
});

export const contentId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names it to the admin: its row's number.",
      examples: [1],
    }),
});

export const CONTENT_SORT_KEYS = [
  "title",
  "slug",
  "createdAt",
  "updatedAt",
] as const;

export const contentSort = z.enum(CONTENT_SORT_KEYS).meta({
  description: "A column of the pages the admin may sort them by.",
  examples: ["title"],
});

export const contentQuery = z.object({
  folder: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .meta({
      description:
        "The folder whose pages are listed, by its id. Left out, the pages at the top, in no folder.",
      examples: [1],
    }),
  q: listingQuery.shape.q.meta({
    description:
      "Free text the folder's pages are searched for, in their title, slug, description and what is written on them, without regard to case. Left out or empty, every page of the folder.",
    examples: ["beliefs"],
  }),
  ...sorting(contentSort),
  ...textColumn("title", "title"),
  ...textColumn("slug", "slug"),
  ...dayColumn("updatedAt", "The day the pages listed were last changed"),
});

export const contentBody = z
  .object({
    slug: slug.meta({
      description: "What the page is called in its address: /<slug>.",
    }),
    title: z
      .string()
      .min(1)
      .meta({ examples: ["About Us – Butte Bible Fellowship"] }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
  })
  .meta({
    id: "ContentBody",
    description:
      "A page's metadata as it is written, what its front matter carried: what creating one takes, and what updating one replaces. What is written on the page is written on its own.",
  });

export const contentPlacement = z
  .object({
    folder: z
      .int()
      .positive()
      .optional()
      .meta({
        description:
          "The folder the page is filed in, by its id. Left out, it is at the top, in no folder.",
        examples: [1],
      }),
  })
  .meta({
    id: "ContentPlacement",
    description:
      "Where a page is filed, on its own: what moving it to another folder takes.",
  });

export const contentDraft = contentBody.extend(contentPlacement.shape).meta({
  id: "ContentDraft",
  description:
    "A new page as it is written: its metadata, and the folder it is made in.",
});

export const contentForm = z
  .object({
    slug: slug.meta({
      description: "What the page is called in its address.",
    }),
    title: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["About Us – Butte Bible Fellowship"] }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
  })
  .meta({
    description:
      "A page's metadata as the admin's form holds it: the body, with the title trimmed.",
  });

export const contentArticle = z
  .object({
    body: hast.optional().meta({
      description:
        "What is written on the page, as rich text: the tree the admin's editor wrote. Left out, it has none.",
    }),
  })
  .meta({
    id: "ContentArticle",
    description:
      "What is written on a page, on its own: what replaces what it has.",
  });
