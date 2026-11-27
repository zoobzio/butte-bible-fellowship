import { z } from "zod";

import { hast } from "./hast";
import { mark } from "./listing";
import { slug } from "./slug";
import { contentStatus } from "./status";

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

export const sermons = z.array(sermon).meta({
  description: "The sermons the site lists, newest first.",
});

export const sermonRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names it to the admin: its row's number.",
        examples: [1],
      }),
    ...sermon.omit({ body: true }).shape,
    status: contentStatus,
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
    id: "SermonRecord",
    description:
      "A sermon as the admin lists it: every column of its row but what is written about it, a draft and an archived one among them.",
  });

export const sermonDetail = z
  .object({
    ...sermonRecord.shape,
    body: z.string().optional().meta({
      description:
        "What is written about it, as the Markdown it was written in. Left out, nothing is.",
    }),
  })
  .meta({
    id: "SermonDetail",
    description:
      "A sermon as the admin reads it on its own page: every column of its row, what is written about it among them.",
  });

export const sermonBatch = z
  .object({
    items: z.array(sermonRecord).meta({
      description:
        "The sermons of this batch, the latest preached first, and of a day the latest added.",
    }),
    cursor: z
      .string()
      .nullable()
      .meta({
        description:
          "What to ask for the batch after this one with, or null where this one is the last.",
        examples: ["2026-10-04.12"],
      }),
    since: mark,
  })
  .meta({
    id: "SermonBatch",
    description:
      "A batch of the sermons as the admin reads them, with the way to the batch after it and the mark it was read at.",
  });

export const sermonSync = z
  .object({
    found: z
      .int()
      .nonnegative()
      .meta({
        description: "How many recordings the channel's feed listed.",
        examples: [15],
      }),
    added: z
      .int()
      .nonnegative()
      .meta({
        description:
          "How many sermons were added: one for each recording the sermons did not hold, and none where they held them all.",
        examples: [1],
      }),
  })
  .meta({
    id: "SermonSync",
    description:
      "What a sync from the church's YouTube channel came to: the recordings its feed listed, and the sermons added from them, each published.",
  });
