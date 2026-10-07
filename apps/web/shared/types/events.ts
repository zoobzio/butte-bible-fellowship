import type { EVENT_DAYS } from "#shared/constants/events";

export type EventDay = (typeof EVENT_DAYS)[number];

/**
 * An event of the church, as the events page's front matter lists it. One
 * with a `date` happens once, on that date; one with a `day` instead repeats
 * every week on that day. Its times are the church's own, on a 24-hour
 * clock: `13:00`.
 */
export interface ChurchEvent {
  title: string;
  /**
   * What the event's own page is called in its address: `/events/<slug>`.
   * Left out, it is made from the title — which a translation changes, so
   * an event with a slug keeps one address in every language.
   */
  slug?: string;
  /** A few words more about it, shown under its title. */
  note?: string;
  /** Where it is held, when that is not at the church. */
  location?: string;
  /** The one date it happens on, as `YYYY-MM-DD`. */
  date?: string;
  /** The day of the week it repeats on. */
  day?: EventDay;
  /**
   * Which of the month's weeks a repeating event is held in — `[1, 3]` is
   * the first and third. Left out, it is held every week.
   */
  weeks?: number[];
  /** When it starts, as `HH:MM`. */
  start: string;
  /** When it ends, as `HH:MM`. */
  end?: string;
}
