import { z } from "zod";

import { hast } from "./hast";
import { slug } from "./slug";

/**
 * A sermon preached at the church, as the API serves it. Its `date` is the
 * day it was preached, its `video` YouTube's id for its recording when it
 * has one. What is written about it, its `body`, is its own page's: a list
 * leaves it out.
 */
export const sermon = z
  .object({
    slug: slug.meta({
      description:
        "What the sermon's own page is called in its address: /sermons/<slug>.",
      examples: ["faith-and-works"],
    }),
    title: z.string().meta({ examples: ["Faith & Works"] }),
    speaker: z
      .string()
      .optional()
      .meta({
        description: "Who preached it, by name.",
        examples: ["Pastor Name"],
      }),
    summary: z
      .string()
      .optional()
      .meta({
        description:
          "A line or two about it, as a card shows and search engines list.",
        examples: ["James 2, and what faith does."],
      }),
    body: hast.optional().meta({
      description:
        "What is written about it, for its own page: the tree the app renders, built from the Markdown it was written as. A list leaves it out.",
    }),
    image: z
      .url()
      .optional()
      .meta({
        description:
          "The URL of its picture. Left out, it is pictured by its video's thumbnail.",
        examples: ["https://cdn.example.com/sermons/faith-and-works.jpg"],
      }),
    video: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "YouTube's id for its recording: what its watch and embed URLs carry. Left out, it is not recorded, or not yet.",
        examples: ["dQw4w9WgXcQ"],
      }),
    date: z.iso.date().meta({
      description: "The day it was preached, as YYYY-MM-DD.",
      examples: ["2026-10-04"],
    }),
  })
  .meta({
    id: "Sermon",
    description:
      "A sermon preached at the church: the day it was preached, who preached it, and its recording on the church's YouTube channel.",
  });

/** The sermons the site lists, newest first. */
export const sermons = z.array(sermon).meta({
  description: "The sermons the site lists, newest first.",
});
