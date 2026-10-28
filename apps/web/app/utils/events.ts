import type { CalendarDay } from "~/types/events";

import type { ChurchEvent, EventDay } from "@bbf/schema/types";

import { EVENT_DAYS } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";

// Dates are calendar days. Do date arithmetic in UTC to prevent DST shifts.

const DAY = 24 * 60 * 60 * 1000;

export const toDate = (date: string) => new Date(`${date}T00:00:00Z`);

const toISO = (date: Date) => date.toISOString().slice(0, 10);

export const churchDate = (now: Date): string => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const addDays = (date: string, days: number) =>
  toISO(new Date(toDate(date).getTime() + days * DAY));

export const addMonths = (date: string, months: number) => {
  const first = toDate(`${date.slice(0, 7)}-01`);
  first.setUTCMonth(first.getUTCMonth() + months);
  return toISO(first);
};

const startOfWeek = (date: string) => addDays(date, -toDate(date).getUTCDay());

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

export const weekOf = (date: string): string[] => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, days) => addDays(start, days));
};

export const dateOfDay = (day: EventDay) =>
  addDays("1970-01-04", EVENT_DAYS.indexOf(day));

export const minutes = (time: string | undefined): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time?.trim() ?? "");
  if (!match) return null;
  const [hours, mins] = [Number(match[1]), Number(match[2])];
  return hours < 24 && mins < 60 ? hours * 60 + mins : null;
};

export const toTime = (time: number) => new Date(time * 60 * 1000);

export const slugOf = (event: ChurchEvent): string => {
  if (event.slug) return event.slug;
  return event.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036F’']/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
};

export const pathOf = (event: ChurchEvent) => `/events/${slugOf(event)}`;

export const occursOn = (event: ChurchEvent, date: string): boolean => {
  if (event.date) return event.date.slice(0, 10) === date;
  const day = toDate(date);
  if (!event.day || event.day !== EVENT_DAYS[day.getUTCDay()]) return false;
  if (!event.weeks?.length) return true;
  return event.weeks.includes(Math.ceil(day.getUTCDate() / 7));
};

const byStart = (events: ChurchEvent[]) => {
  const start = (event: ChurchEvent) => minutes(event.start) ?? -1;
  return events.toSorted((a, b) => start(a) - start(b));
};

export const eventsOn = (events: ChurchEvent[], date: string) =>
  byStart(events.filter((event) => occursOn(event, date)));

export const heldOn = (events: ChurchEvent[], day: EventDay) =>
  byStart(events.filter((event) => !event.date && event.day === day));

export const calendar = (events: ChurchEvent[], date: string): CalendarDay[] =>
  monthOf(date).map((day) => ({ date: day, events: eventsOn(events, day) }));

export const week = (events: ChurchEvent[], date: string): CalendarDay[] =>
  weekOf(date).map((day) => ({ date: day, events: eventsOn(events, day) }));
