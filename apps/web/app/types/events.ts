import type { ChurchEvent } from "#shared/types/events";

/** A day of the calendar, with the events held on it in the order they start. */
export interface CalendarDay {
  /** The day's date, as `YYYY-MM-DD`. */
  date: string;
  events: ChurchEvent[];
}
