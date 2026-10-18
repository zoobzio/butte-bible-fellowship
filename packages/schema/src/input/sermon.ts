import { z } from "zod";

import { slug } from "../models/slug";
import { contentStatus } from "../models/staff";

/** The path of a sermon's own page: `/sermons/{slug}`. */
export const sermonPath = z.object({
  slug: slug.meta({
    description: "What the sermon's own page is called in its address.",
    examples: ["faith-and-works"],
  }),
});

/** The most sermons one request lists. */
export const SERMONS_LIMIT = 50;

/** The query of the sermons list: how many of the newest to take. */
export const sermonsQuery = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SERMONS_LIMIT)
    .default(15)
    .meta({
      description: `How many of the newest sermons to list, up to ${SERMONS_LIMIT}.`,
      examples: [3],
    }),
});

/**
 * A sermon as it is written: what creating one takes, and what updating one
 * replaces, every field. A new sermon is a draft until the body says
 * otherwise.
 */
export const sermonBody = z
  .object({
    slug: slug.meta({
      description: "What the sermon's own page is called in its address.",
      examples: ["faith-and-works"],
    }),
    title: z
      .string()
      .min(1)
      .meta({ examples: ["Faith & Works"] }),
    speaker: z.string().optional().meta({
      description: "Who preached it, by name.",
    }),
    summary: z.string().optional().meta({
      description:
        "A line or two about it, as a card shows and search engines list.",
    }),
    body: z.string().optional().meta({
      description: "What is written about it, as Markdown, for its own page.",
    }),
    image: z.url().optional().meta({
      description: "The URL of its picture.",
    }),
    video: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "YouTube's id for its recording.",
        examples: ["dQw4w9WgXcQ"],
      }),
    date: z.iso.date().meta({
      description: "The day it was preached, as YYYY-MM-DD.",
      examples: ["2026-10-04"],
    }),
    status: contentStatus.default("draft").meta({
      description: "Whether it reaches the site. Left out, a draft.",
    }),
  })
  .meta({
    id: "SermonBody",
    description:
      "A sermon as it is written: what creating one takes, and what updating one replaces.",
  });
