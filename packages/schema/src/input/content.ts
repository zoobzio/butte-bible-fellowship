import { z } from "zod";

import { hast } from "../models/hast";
import { contentLocation } from "../models/path";
import { slug } from "../models/slug";
import { folderBody } from "./folder";
import { dayColumn, listingQuery, sorting, textColumn } from "./listing";

export const contentPath = z.object({
  slug: slug.meta({
    description: "What the page is called in its address.",
    examples: ["about-us"],
  }),
});

export const CONTENT_SORT_KEYS = [
  "title",
  "slug",
  "mime",
  "size",
  "createdAt",
  "updatedAt",
] as const;

export const contentSort = z.enum(CONTENT_SORT_KEYS).meta({
  description: "A column of the pages the admin may sort them by.",
  examples: ["title"],
});

export const contentQuery = z.object({
  q: listingQuery.shape.q.meta({
    description:
      "Free text the folder is searched for: its pages in their title, slug, description and what is written on them, and the folders inside it in their name, without regard to case. Left out or empty, all the folder holds.",
    examples: ["beliefs"],
  }),
  ...sorting(contentSort),
  ...textColumn("title", "title"),
  ...textColumn("slug", "slug"),
  ...textColumn("mime", "media type"),
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

export const contentEntry = z
  .discriminatedUnion("kind", [
    contentBody.extend({ kind: z.literal("document") }),
    folderBody.extend({ kind: z.literal("folder") }),
  ])
  .meta({
    id: "ContentEntry",
    description:
      "What is made in a folder, the one the address names: a new document, by its metadata, or a new folder, by its name.",
  });

export const contentMove = z
  .object({
    parent: contentLocation.meta({
      description:
        "The folder it is moved into, by its path. Empty, it is moved to the top.",
    }),
  })
  .meta({
    id: "ContentMove",
    description:
      "Where a document or a folder is, on its own: what moving it into another folder takes.",
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

export const contentPatch = z
  .union([contentMove, contentArticle.strict()])
  .meta({
    id: "ContentPatch",
    description:
      "One part of what a path names, written on its own: where it is, a document's or a folder's, or what is written on a document.",
  });
