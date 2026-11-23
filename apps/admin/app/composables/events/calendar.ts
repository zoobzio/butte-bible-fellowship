import type { EventRecords } from "@bbf/schema/types";

import type { CalendarEntries, CalendarFetch } from "~/types/calendar";

import { eventRecords } from "@bbf/schema";
import { createCalendar } from "#imports";
import { useApi } from "~/composables/api";
import { HELD } from "~/composables/events/routes";
import { EVENTS_CALENDAR } from "~/constants/events";
import { toEntry, toWindowQuery } from "~/utils/events";

const api = useApi();

/**
 * The events held within the days the calendar shows, over the admin's
 * API, narrowed by its search.
 */
const fetch: CalendarFetch<EventRecords> = async (params, calendar) =>
  eventRecords.parse(
    await api(HELD, { query: toWindowQuery(calendar.days, params) }),
  );

/**
 * The events calendar: the config of the constants over the admin's API.
 * Each move through time, and each change to the search, asks the API for
 * the events held within the days the calendar then shows, and reads each
 * as an entry the calendar recurs itself, in the church's time zone. It
 * writes nothing: an event is changed on its own page. The layer's factory
 * names the search's fields and its text literal from the prose as the
 * calendar is built in setup, in the visitor's locale.
 *
 * The calendar syncs: the API keeps no account of what changed, a removal
 * least of all, so each poll asks for the days again as they stand, and
 * they land without the calendar loading.
 */
export const useEventsCalendar = createCalendar<EventRecords, CalendarEntries>(
  "events",
  {
    ...EVENTS_CALENDAR,
    read: (records, { timeZone }) =>
      records.map((record) => toEntry(record, timeZone)),
    write: (entries) => entries,
    fetch,
    refresh: fetch,
  },
);
