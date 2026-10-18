import { z } from "zod";

import { slug } from "./slug";

/** The days of the week an event can repeat on, Sunday first. */
export const EVENT_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

/** A day of the week, as an event names the one it repeats on. */
export const eventDay = z.enum(EVENT_DAYS).meta({
  id: "EventDay",
  description: "A day of the week, as an event names the one it repeats on.",
  examples: ["sunday"],
});

/** A time of day on a 24-hour clock, `HH:MM`: `13:00`. */
export const eventTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "a time, as HH:MM")
  .meta({
    id: "EventTime",
    description: "A time of day on a 24-hour clock, as HH:MM.",
    examples: ["13:00"],
  });

/**
 * An event of the church, as the API serves it and the events page's front
 * matter lists it. One with a `date` happens once, on that date; one with a
 * `day` instead repeats every week on that day. Its times are the church's
 * own.
 */
export const churchEvent = z
  .object({
    title: z.string().meta({ examples: ["Worship Service"] }),
    slug: slug.optional().meta({
      description:
        "What the event's own page is called in its address: /events/<slug>. Left out, it is made from the title — which a translation changes, so an event with a slug keeps one address in every language.",
    }),
    note: z
      .string()
      .optional()
      .meta({
        description: "A few words more about it, shown under its title.",
        examples: ["All welcome"],
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
