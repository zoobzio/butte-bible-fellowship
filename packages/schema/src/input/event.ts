import { z } from "zod";

import { eventDay, eventTime } from "../models/event";
import { slug } from "../models/slug";

/** The path of an event's own page: `/events/{slug}`. */
export const eventPath = z.object({
  slug: slug.meta({
    description: "What the event's own page is called in its address.",
    examples: ["worship-service"],
  }),
});

/** The query of the events list: from which date the one-offs are listed. */
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

/**
 * An event as it is written: what creating one takes, and what updating one
 * replaces, every field. It happens once, on its `date`, or repeats every
 * week on its `day`: one of the two, never both. Only a repeating event
 * picks its `weeks`, and an `end` comes after its `start`.
 */
export const eventBody = z
  .object({
    slug: slug.meta({
      description: "What the event's own page is called in its address.",
    }),
    title: z
      .string()
      .min(1)
      .meta({ examples: ["Worship Service"] }),
    note: z.string().optional().meta({
      description: "A few words more about it, shown under its title.",
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
          "Which of the month's weeks a repeating event is held in: [1, 3] is the first and third. Left out, it is held every week.",
        examples: [[1, 3]],
      }),
    start: eventTime.meta({ description: "When it starts." }),
    end: eventTime.optional().meta({ description: "When it ends." }),
  })
  .check((ctx) => {
    const { date, day, weeks, start, end } = ctx.value;
    if ((date === undefined) === (day === undefined)) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message:
          "an event happens once, on a date, or repeats on a day: one of the two",
        path: [date === undefined ? "date" : "day"],
      });
    }
    if (weeks !== undefined && day === undefined) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "only a repeating event picks its weeks",
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
  })
  .meta({
    id: "EventBody",
    description:
      "An event as it is written. It happens once, on its date, or repeats every week on its day: one of the two. Only a repeating event picks its weeks, and an end comes after its start.",
  });
