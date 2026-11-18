import type { CalendarOptions, UseCalendar } from "#imports";

/**
 * The calendar's own form, as the layer's options name it: the entries a
 * reader hands the calendar, whatever it read them from.
 */
export type CalendarEntries = ReturnType<
  CalendarOptions<unknown, unknown>["read"]
>;

/** One entry of the calendar's own form: what a record is read as. */
export type CalendarEntry = CalendarEntries[number];

/**
 * A calendar as the app configures it: the descriptors alone. The reader,
 * the writer and the fetch are wired where the calendar is created.
 */
export type CalendarConfig = Omit<
  CalendarOptions<unknown, unknown>,
  "read" | "write" | "fetch" | "save" | "now" | "uid" | "initial"
>;

export type CalendarFetch<I> = CalendarOptions<I, unknown>["fetch"];

export type CalendarFetchParams = Parameters<CalendarFetch<unknown>>[0];

export type CalendarService<I, O> = ReturnType<UseCalendar<I, O>>;
