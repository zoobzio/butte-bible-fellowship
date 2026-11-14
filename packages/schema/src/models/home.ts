import { z } from "zod";

import { hast } from "./hast";
import { link } from "./link";
import { page } from "./page";

const heading = z.string().meta({
  description:
    "The heading the home page opens with: one line, of which the site draws what stands between two pairs of asterisks as its highlight.",
  examples: ["Discover God’s **Love, Grace & Truth**"],
});

const image = z
  .string()
  .optional()
  .meta({
    description:
      "The picture beside the words: the URL of the image uploaded for it. Left out, the site shows its own.",
    examples: ["https://cdn.example.com/home/1.jpg"],
  });

export const homeHero = z
  .object({
    heading,
    description: z.string().meta({
      description: "The paragraph under the heading.",
    }),
    action: z.string().meta({
      description: "What the button under the paragraph says.",
      examples: ["Learn More"],
    }),
    link: link.meta({
      description: "Where the button leads.",
      examples: ["/about-us"],
    }),
    image,
  })
  .meta({
    id: "HomeHero",
    description:
      "What the home page opens with: a heading, a paragraph, a button and a picture.",
  });

export const homePage = page
  .pick({ title: true, description: true })
  .extend({ hero: homeHero })
  .meta({
    id: "HomePage",
    description:
      "The home page's front matter, as the site reads it: its title and description, and the hero it opens with.",
  });

export const homeRecord = z
  .object({
    title: z.string().meta({
      description: "What the browser's tab and search engines show.",
      examples: ["Butte Bible Fellowship – The Church on Pillsbury Road"],
    }),
    description: z.string().optional().meta({
      description: "What search engines show for the page.",
    }),
    heroHeading: heading,
    heroDescription: homeHero.shape.description,
    heroAction: homeHero.shape.action,
    heroLink: homeHero.shape.link,
    heroImage: image,
    body: hast.optional().meta({
      description:
        "What is written on the page, under its hero, as rich text: the tree the app renders, as the admin's editor wrote it, the site's own blocks among its elements.",
    }),
    updatedAt: z.iso.datetime().meta({
      description: "When the page was last changed.",
      examples: ["2026-10-17T18:00:00.000Z"],
    }),
  })
  .meta({
    id: "HomeRecord",
    description:
      "The home page, as the admin reads it: every column of its one row.",
  });
