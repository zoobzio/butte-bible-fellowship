import type { ChurchEvent } from "@bbf/schema/types";

export interface CalendarDay {
  date: string;
  events: ChurchEvent[];
}

export interface EventsConfig {
  image: string;
}

export interface EventListing {
  title: string;
  time?: string;
  note?: string;
  to: string;
}

export interface DayListing {
  date: string;
  label: string;
  events: EventListing[];
}

export interface CalendarCell {
  date: string;
  number: number;
  label: string;
  events: EventListing[];
  today: boolean;
  selected: boolean;
  outside: boolean;
}
