import type { ChurchEvent } from "#shared/types/events";

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
