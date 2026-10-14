import { z } from "zod";

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
export const eventDay = z.enum(EVENT_DAYS);

/** A time of day on a 24-hour clock, `HH:MM`: `13:00`. */
export const eventTime = z.string().regex(/^\d{2}:\d{2}$/, "a time, as HH:MM");

/**
 * An event of the church, as the events page's front matter lists it. One
 * with a `date` happens once, on that date; one with a `day` instead repeats
 * every week on that day. Its times are the church's own.
 */
export const churchEvent = z.object({
  title: z.string(),
  /**
   * What the event's own page is called in its address: `/events/<slug>`.
   * Left out, it is made from the title — which a translation changes, so
   * an event with a slug keeps one address in every language.
   */
  slug: z.string().optional(),
  /** A few words more about it, shown under its title. */
  note: z.string().optional(),
  /** Where it is held, when that is not at the church. */
  location: z.string().optional(),
  /** The one date it happens on, as `YYYY-MM-DD`. */
  date: z.iso.date().optional(),
  /** The day of the week it repeats on. */
  day: eventDay.optional(),
  /**
   * Which of the month's weeks a repeating event is held in — `[1, 3]` is
   * the first and third. Left out, it is held every week.
   */
  weeks: z.array(z.int().min(1).max(5)).optional(),
  /** When it starts. */
  start: eventTime,
  /** When it ends. */
  end: eventTime.optional(),
});
