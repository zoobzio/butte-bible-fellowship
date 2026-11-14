import { z } from "zod";

import { hast } from "../models/hast";
import { link } from "../models/link";

/** A line of the page that must say something. */
const words = z.string().min(1);

export const homeBody = z
  .object({
    title: words.meta({
      examples: ["Butte Bible Fellowship – The Church on Pillsbury Road"],
    }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
    heroHeading: words.meta({
      description:
        "The heading the page opens with: one line, of which the site draws what stands between two pairs of asterisks as its highlight.",
      examples: ["Discover God’s **Love, Grace & Truth**"],
    }),
    heroDescription: words.meta({
      description: "The paragraph under the heading.",
    }),
    heroAction: words.meta({
      description: "What the button under the paragraph says.",
      examples: ["Learn More"],
    }),
    heroLink: link.meta({
      description: "Where the button leads.",
      examples: ["/about-us"],
    }),
  })
  .meta({
    id: "HomeBody",
    description:
      "The home page's metadata as it is written: what the browser and search engines show for it, and the words of the hero it opens with. Its picture and what is written on the page are each written on their own.",
  });

/** A line of the page that must say something, as a form holds it. */
const typed = z.string().trim().min(1);

export const homeForm = z
  .object({
    title: typed,
    description: z.string().optional(),
    heroHeading: typed,
    heroDescription: typed,
    heroAction: typed,
    heroLink: z.string().trim().pipe(link),
  })
  .meta({
    description:
      "The home page's metadata as the admin's form holds it: the body, with each line trimmed.",
  });

export const homeArticle = z
  .object({
    body: hast.optional().meta({
      description:
        "What is written on the page, as rich text: the tree the admin's editor wrote. Left out, it has none.",
    }),
  })
  .meta({
    id: "HomeArticle",
    description:
      "What is written on the home page, on its own: what replaces what it has.",
  });

/** The kinds of image the hero's picture may be, by media type. */
export const HOME_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** The most the hero's picture may weigh, in bytes: 4 MB. */
export const HOME_IMAGE_SIZE = 4 * 1024 * 1024;

export const homeImage = z
  .file()
  .max(HOME_IMAGE_SIZE)
  .mime([...HOME_IMAGE_TYPES])
  .meta({
    description:
      "The picture of the home page's hero as it is uploaded: a JPEG, PNG or WebP image of 4 MB at most.",
  });
