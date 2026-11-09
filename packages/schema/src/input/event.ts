import { z } from "zod";

import { eventDay, eventTime } from "../models/event";
import { hast } from "../models/hast";
import { slug } from "../models/slug";
import {
  dayColumn,
  listingQuery,
  matchColumn,
  sorting,
  textColumn,
} from "./listing";

export const eventPath = z.object({
  slug: slug.meta({
    description: "What the event's own page is called in its address.",
    examples: ["worship-service"],
  }),
});

export const eventId = z.object({
  id: z.coerce
    .number()
    .int()
    .positive()
    .meta({
      description: "What names it to the admin: its row's number.",
      examples: [1],
    }),
});

export const eventsQuery = z.object({
  from: z.iso
    .date()
    .optional()
    .meta({
      description:
        "The date the one-off events are listed from, as YYYY-MM-DD. Left out, today, in the church's own time.",
      examples: ["2026-10-17"],
    }),
});

export const EVENT_SORT_KEYS = [
  "title",
  "slug",
  "day",
  "date",
  "recurring",
  "start",
  "createdAt",
  "updatedAt",
] as const;

export const eventSort = z.enum(EVENT_SORT_KEYS).meta({
  description: "A column of the events the admin may sort them by.",
  examples: ["title"],
});

/** Yes or no, as a query string says it: `true` or `false`. */
const flag = z.stringbool({ truthy: ["true"], falsy: ["false"] });

export const eventQuery = listingQuery.extend({
  ...sorting(eventSort),
  ...matchColumn("recurring", flag, "answer to whether they recur"),
  ...matchColumn("day", eventDay, "day of the week"),
  ...textColumn("title", "title"),
  ...textColumn("slug", "slug"),
  ...textColumn("summary", "summary"),
  ...textColumn("image", "picture's URL"),
  ...dayColumn("date", "The date the events listed are held"),
  ...dayColumn("updatedAt", "The day the events listed were last changed"),
  ...dayColumn("createdAt", "The day the events listed were added"),
});

/**
 * What the timing rules read of an event as it is written, whichever way
 * its weeks are held.
 */
interface EventTiming {
  recurring: boolean;
  weeks?: unknown[];
  start: string;
  end?: string;
}

/**
 * The rules a model cannot say, which the database's constraints keep:
 * only a recurring event picks its weeks, and an end comes after its
 * start. Each is reported at the field it is about.
 */
const timing = (ctx: z.core.ParsePayload<EventTiming>) => {
  const { recurring, weeks, start, end } = ctx.value;
  if (weeks !== undefined && !recurring) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: "only a recurring event picks its weeks",
      path: ["weeks"],
    });
  }
  if (end !== undefined && end <= start) {
    ctx.issues.push({
      code: "custom",
      input: ctx.value,
      message: "an event ends after it starts",
      path: ["end"],
    });
  }
};

const eventFields = z.object({
  slug: slug.meta({
    description: "What the event's own page is called in its address.",
  }),
  title: z
    .string()
    .min(1)
    .meta({ examples: ["Worship Service"] }),
  summary: z.string().optional().meta({
    description:
      "A line or two about it, as a card shows and search engines list.",
  }),
  date: z.iso.date().meta({
    description:
      "The date it is held, as YYYY-MM-DD. A recurring event is held every week on this date's day of the week.",
    examples: ["2026-10-17"],
  }),
  recurring: z.boolean().default(false).meta({
    description:
      "Whether it is held every week, on the day of the week of its date. Left out, it is held on its date alone.",
  }),
  weeks: z
    .array(z.int().min(1).max(5))
    .optional()
    .meta({
      description:
        "Which of the month's weeks a recurring event is held in: [1, 3] is the first and third. Left out, it is held every week.",
      examples: [[1, 3]],
    }),
  start: eventTime.meta({ description: "When it starts." }),
  end: eventTime.optional().meta({ description: "When it ends." }),
});

export const eventBody = eventFields.check(timing).meta({
  id: "EventBody",
  description:
    "An event's details as they are written: what creating one takes, and what updating one replaces. It is held on its date, or every week on that date's day of the week when it recurs. Only a recurring event picks its weeks, and an end comes after its start. Its picture and what is written about it are each written on their own.",
});

/** The weeks of the month a form offers, each as a select writes it. */
export const EVENT_WEEKS = ["1", "2", "3", "4", "5"] as const;

export const eventForm = eventFields
  .extend({
    title: z
      .string()
      .trim()
      .min(1)
      .meta({ examples: ["Worship Service"] }),
    weeks: z
      .array(z.enum(EVENT_WEEKS))
      .optional()
      .meta({
        description:
          "Which of the month's weeks a recurring event is held in, each as the form's select writes it. Left out, every week.",
        examples: [["1", "3"]],
      }),
  })
  .check(timing)
  .meta({
    description:
      "An event's details as the admin's form holds them: the body, with the title trimmed and each week as a select writes it.",
  });

export const eventArticle = z
  .object({
    body: hast.optional().meta({
      description:
        "What is written about it, for its own page, as rich text: the tree the admin's editor wrote. Left out, it has none.",
    }),
  })
  .meta({
    id: "EventArticle",
    description:
      "What is written about an event, on its own: what replaces what it has.",
  });

/** The kinds of image an event's picture may be, by media type. */
export const EVENT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** The most an event's picture may weigh, in bytes: 4 MB. */
export const EVENT_IMAGE_SIZE = 4 * 1024 * 1024;

export const eventImage = z
  .file()
  .max(EVENT_IMAGE_SIZE)
  .mime([...EVENT_IMAGE_TYPES])
  .meta({
    description:
      "An event's picture as it is uploaded: a JPEG, PNG or WebP image of 4 MB at most.",
  });
