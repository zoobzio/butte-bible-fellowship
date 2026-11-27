import { z } from "zod";

import { slug } from "../models/slug";
import { contentStatus } from "../models/status";
import { dayColumn, matchColumn, since, textColumn } from "./listing";

export const sermonPath = z.object({
  slug: slug.meta({
    description: "What the sermon's own page is called in its address.",
    examples: ["faith-and-works"],
  }),
});

export const SERMONS_LIMIT = 50;

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
    status: contentStatus.default("published").meta({
      description: "Whether it reaches the site. Left out, published.",
    }),
  })
  .meta({
    id: "SermonBody",
    description:
      "A sermon as it is written: what creating one takes, and what updating one replaces.",
  });

export const sermonForm = sermonBody.omit({ body: true }).meta({
  description:
    "A sermon's details as the admin's form holds them: the body, less what is written about it, which is shown on its own.",
});

export const sermonId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names it to the admin: its row's number.",
      examples: [1],
    }),
});

/**
 * Where a batch of the sermons ends, as the batch after it is asked for:
 * the day its last sermon was preached and that sermon's id, joined by a
 * dot.
 */
export const SERMON_CURSOR = /^(\d{4}-\d{2}-\d{2})\.([1-9]\d*)$/;

export const SERMON_BATCH_MAX = 100;

export const sermonBatchQuery = z.object({
  cursor: z
    .string()
    .regex(SERMON_CURSOR, "a cursor: the one a batch of the sermons ended with")
    .optional()
    .meta({
      description:
        "Where the batch before ended, as it answered. Left out, the first batch.",
      examples: ["2026-10-04.12"],
    }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(SERMON_BATCH_MAX)
    .default(30)
    .meta({
      description: `How many sermons the batch holds, up to ${SERMON_BATCH_MAX}.`,
      examples: [30],
    }),
  since,
  q: z
    .string()
    .trim()
    .optional()
    .meta({
      description:
        "Free text the sermons are searched for, in the title, the speaker and the summary, without regard to case. Left out or empty, every sermon.",
      examples: ["faith"],
    }),
  ...matchColumn("status", contentStatus, "status"),
  ...textColumn("title", "title"),
  ...textColumn("speaker", "speaker"),
  ...textColumn("summary", "summary"),
  ...dayColumn("date", "The day the sermons listed were preached"),
});
