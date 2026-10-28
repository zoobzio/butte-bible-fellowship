import { z } from "zod";

import { hast } from "./hast";
import { listing } from "./listing";
import { slug } from "./slug";
import { contentStatus } from "./staff";

export const EVENT_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const eventDay = z.enum(EVENT_DAYS).meta({
  id: "EventDay",
  description: "A day of the week, as an event names the one it repeats on.",
  examples: ["sunday"],
});

export const eventTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "a time, as HH:MM")
  .meta({
    id: "EventTime",
    description: "A time of day on a 24-hour clock, as HH:MM.",
    examples: ["13:00"],
  });

export const churchEvent = z
  .object({
    slug: slug.meta({
      description:
        "What the event's own page is called in its address: /events/<slug>.",
      examples: ["worship-service"],
    }),
    title: z.string().meta({ examples: ["Worship Service"] }),
    note: z
      .string()
      .optional()
      .meta({
        description: "A few words more about it, shown under its title.",
        examples: ["All welcome"],
      }),
    summary: z
      .string()
      .optional()
      .meta({
        description:
          "A line or two about it, as a card shows and search engines list.",
        examples: ["We gather on Sunday morning to worship God together."],
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
          "The URL of its picture. Left out, it is pictured by the church.",
        examples: ["https://cdn.example.com/events/worship-service.jpg"],
      }),
    location: z
      .string()
      .optional()
      .meta({
        description: "Where it is held, when that is not at the church.",
        examples: ["Bidwell Park"],
      }),
    date: z.iso
      .date()
      .optional()
      .meta({
        description: "The one date it happens on, as YYYY-MM-DD.",
        examples: ["2026-10-17"],
      }),
    day: eventDay.optional().meta({
      description: "The day of the week it repeats on.",
    }),
    weeks: z
      .array(z.int().min(1).max(5))
      .optional()
      .meta({
        description:
          "Which of the month's weeks a repeating event is held in: [1, 3] is the first and third. Left out, it is held every week.",
        examples: [[1, 3]],
      }),
    start: eventTime.meta({ description: "When it starts." }),
    end: eventTime.optional().meta({ description: "When it ends." }),
  })
  .meta({
    id: "ChurchEvent",
    description:
      "An event of the church. One with a date happens once, on that date; one with a day instead repeats every week on that day. Its times are the church's own.",
  });

export const churchEvents = z.array(churchEvent).meta({
  description:
    "The events the site lists: the repeating ones Sunday first, then the one-offs to come.",
});

export const eventRecord = z
  .object({
    id: z
      .int()
      .positive()
      .meta({
        description: "What names it to the admin: its row's number.",
        examples: [1],
      }),
    slug: slug.meta({
      description: "What the event's own page is called in its address.",
    }),
    title: z.string().meta({ examples: ["Worship Service"] }),
    note: z.string().optional().meta({
      description: "A few words more about it, shown under its title.",
    }),
    summary: z.string().optional().meta({
      description:
        "A line or two about it, as a card shows and search engines list.",
    }),
    body: z.string().optional().meta({
      description: "What is written about it, as Markdown, as it was written.",
    }),
    image: z.url().optional().meta({
      description: "The URL of its picture.",
    }),
    location: z.string().optional().meta({
      description: "Where it is held, when that is not at the church.",
    }),
    date: z.iso
      .date()
      .optional()
      .meta({
        description: "The one date it happens on, as YYYY-MM-DD.",
        examples: ["2026-10-17"],
      }),
    day: eventDay.optional().meta({
      description: "The day of the week it repeats on.",
    }),
    weeks: z
      .array(z.int().min(1).max(5))
      .optional()
      .meta({
        description:
          "Which of the month's weeks a repeating event is held in. Left out, every week.",
        examples: [[1, 3]],
      }),
    start: eventTime.meta({ description: "When it starts." }),
    end: eventTime.optional().meta({ description: "When it ends." }),
    status: contentStatus.meta({
      description: "Whether it reaches the site.",
    }),
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
    id: "EventRecord",
    description:
      "An event of the church, as the admin reads it: every column of its row, whatever its status.",
  });

export const eventListing = listing(eventRecord).meta({
  id: "EventListing",
  description:
    "A page of the events, as the admin lists them: the repeating ones Sunday first, then the one-offs by date, whatever their status.",
});
