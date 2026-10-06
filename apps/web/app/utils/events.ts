import type { ChurchEvent } from "#shared/types/events";

import type { CalendarDay } from "~/types/events";

import { EVENT_DAYS, EVENT_TIME_ZONE } from "#shared/constants/events";

// A date here is a day on the calendar, written `YYYY-MM-DD`, and not a
// moment: the arithmetic is done in UTC, where every day is the same length,
// so no time zone or daylight saving shifts it.

const DAY = 24 * 60 * 60 * 1000;

/** A date's day, as the moment it starts in UTC. */
export const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

const toISO = (date: Date) => date.toISOString().slice(0, 10);

/** The date at the church at a moment, wherever it is being asked. */
export const churchDate = (now: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const addDays = (date: string, days: number) =>
  toISO(new Date(toDate(date).getTime() + days * DAY));

/** The first of the month a number of months from a date's own. */
export const addMonths = (date: string, months: number) => {
  const first = toDate(`${date.slice(0, 7)}-01`);
  first.setUTCMonth(first.getUTCMonth() + months);
  return toISO(first);
};

/** The Sunday a date's week starts on. */
const startOfWeek = (date: string) => addDays(date, -toDate(date).getUTCDay());

/**
 * The dates the calendar shows for a date's month: the month in whole
 * weeks, Sunday to Saturday — so it opens and closes with the days of its
 * neighbors that share those weeks.
 */
export const monthOf = (date: string): string[] => {
  const end = addDays(startOfWeek(addDays(addMonths(date, 1), -1)), 6);
  const dates: string[] = [];
  for (
    let day = startOfWeek(addMonths(date, 0));
    day <= end;
    day = addDays(day, 1)
  ) {
    dates.push(day);
  }
  return dates;
};

/** The dates of a date's week, Sunday to Saturday. */
export const weekOf = (date: string): string[] => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, days) => addDays(start, days));
};

/** A time of day written `HH:MM`, in minutes — `null` when it is not one. */
export const minutes = (time: string | undefined): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time?.trim() ?? "");
  if (!match) return null;
  const [hours, mins] = [Number(match[1]), Number(match[2])];
  return hours < 24 && mins < 60 ? hours * 60 + mins : null;
};

/** A time of day, in minutes, as a moment a formatter set to UTC can be handed. */
export const toTime = (time: number) => new Date(time * 60 * 1000);

/**
 * What an event's page is called in its address: its own slug, or one made
 * from its title — lowercase, without accents, a hyphen for every run of
 * anything that is not a letter or a number.
 */
export const slugOf = (event: ChurchEvent): string => {
  if (event.slug) return event.slug;
  return event.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036F’']/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
};

/** Where an event's own page is. */
export const pathOf = (event: ChurchEvent) => `/events/${slugOf(event)}`;

/**
 * Whether an event is held on a date. One with a date of its own is held
 * then and only then. One with a day of the week is held on every such day,
 * or — given `weeks` — on those of the month's: the third Tuesday is the
 * Tuesday that falls on the 15th to the 21st.
 */
export const occursOn = (event: ChurchEvent, date: string): boolean => {
  if (event.date) return event.date.slice(0, 10) === date;
  const day = toDate(date);
  if (!event.day || event.day !== EVENT_DAYS[day.getUTCDay()]) return false;
  if (!event.weeks?.length) return true;
  return event.weeks.includes(Math.ceil(day.getUTCDate() / 7));
};

/**
 * The events held on a date, from the earliest start. An event whose start
 * cannot be read leads the day.
 */
export const eventsOn = (events: ChurchEvent[], date: string) => {
  const start = (event: ChurchEvent) => minutes(event.start) ?? -1;
  return events
    .filter((event) => occursOn(event, date))
    .sort((a, b) => start(a) - start(b));
};

/** The days the calendar shows for a date's month, each with its events. */
export const calendar = (events: ChurchEvent[], date: string): CalendarDay[] =>
  monthOf(date).map((day) => ({ date: day, events: eventsOn(events, day) }));

/** The days of a date's week, each with its events. */
export const week = (events: ChurchEvent[], date: string): CalendarDay[] =>
  weekOf(date).map((day) => ({ date: day, events: eventsOn(events, day) }));
