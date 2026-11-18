import type { EventRecord, EventView } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { CalendarConfig } from "~/types/calendar";
import type { RecordLink } from "~/types/listing";

import { EVENT_CALENDAR_VIEWS, EVENT_DAYS, eventView } from "@bbf/schema";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { matching, optional, textual } from "~/constants/listing";

/**
 * The way to an event's details: the page an occurrence on the calendar
 * leads to, by the number of the event's row.
 */
export const link: RecordLink<Pick<EventRecord, "id">> = (record) =>
  `/events/${record.id}/details`;

/**
 * The events as the admin lays them out: a calendar of the church's own
 * days, a month at a time at first, a week, or the days to come as a list,
 * its weeks starting on Sunday as the site's do. The free text searches
 * the title, the slug, the summary and what is written about the event;
 * beside it, each text field filters on the text it holds, carries, starts
 * or ends with, an optional one on whether it is filled in too, and the
 * day and whether it recurs on a value held or not. The date an event is
 * held is no field: the days the calendar shows are what it is asked for.
 * Each field's label is a message of the prose, which the layer's factory
 * resolves, as it names the search's text literal.
 */
export const EVENTS_CALENDAR: CalendarConfig = {
  views: [...EVENT_CALENDAR_VIEWS],
  timeZone: TIME_ZONE,
  firstDayOfWeek: "su",
  fields: {
    title: { label: "admin.event.title", icon: "text", ...textual },
    day: {
      label: "admin.event.day",
      icon: "calendar-days",
      values: [...EVENT_DAYS],
      ...matching,
    },
    recurring: {
      label: "admin.event.recurring",
      icon: "calendar-clock",
      values: ["true", "false"],
      ...matching,
    },
    slug: { label: "admin.editor.slug", icon: "text", ...textual },
    summary: { label: "admin.editor.summary", icon: "text", ...optional },
    image: { label: "admin.event.image", icon: "image", ...optional },
  },
};

/**
 * The views the events calendar starts with, before any a user saves: the
 * one, every event a month at a time, the calendar as it is first shown.
 * Its name is a message of the prose, which the tabs resolve.
 */
export const EVENT_VIEWS: {
  id: string;
  name: Extract<AppProsaryMessage, string>;
  payload: EventView;
}[] = [
  {
    id: "all",
    name: "admin.events.allView",
    payload: eventView.parse({}),
  },
];
