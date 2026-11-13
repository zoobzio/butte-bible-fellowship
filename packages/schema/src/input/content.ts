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

export const contentQuery = listingQuery.extend({
  ...sorting(contentSort),
  ...textColumn("title", "title"),
  ...textColumn("slug", "slug"),
  ...textColumn("description", "description"),
  ...dayColumn("updatedAt", "The day the pages listed were last changed"),
  ...dayColumn("createdAt", "The day the pages listed were added"),
});

export const contentBody = z
  .object({
    slug: slug.meta({
      description:
        "What the page is called in its address: /<slug>, and index for the home page.",
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
