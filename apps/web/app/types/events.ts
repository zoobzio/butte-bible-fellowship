import type { ChurchEvent } from "@bbf/schema/types";

/** A day of the calendar, with the events held on it in the order they start. */
export interface CalendarDay {
  /** The day's date, as `YYYY-MM-DD`. */
  date: string;
  events: ChurchEvent[];
}

/** The events: what an event's page shows until it says otherwise. */
export interface EventsConfig {
  /** The picture over an event nothing is written about yet, or whose page names none. */
  image: string;
}

/**
 * An event as a list sets it: its title and note, when it is held, and the
 * way to its page.
 */
export interface EventListing {
  title: string;
  /** When the event is held, as the list says it: left out when it cannot say. */
  time?: string;
  note?: string;
  /** Where the event's page is, in the reader's locale. */
  to: string;
}

/** A day as the week lists it: its date, said in a few words, and its events. */
export interface DayListing {
  /** The day's date, as `YYYY-MM-DD`. */
  date: string;
  label: string;
  events: EventListing[];
}

/** A day as the calendar shows it. */
export interface CalendarCell {
  /** The day's date, as `YYYY-MM-DD`. */
  date: string;
  /** The day of the month. */
  number: number;
  /** What the day's button is named: its date, and how much is on. */
  label: string;
  events: EventListing[];
  today: boolean;
  selected: boolean;
  /** Whether the day is of a month beside the one shown. */
  outside: boolean;
}
