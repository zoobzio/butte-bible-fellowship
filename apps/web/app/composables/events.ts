import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import type {
  CalendarCell,
  CalendarDay,
  DayListing,
  EventListing,
} from "~/types/events";
import type { PageItem } from "~/types/page";

import type { ChurchEvent, EventDay } from "@bbf/validators/types";

import {
  computed,
  onMounted,
  ref,
  toValue,
  useAppConfig,
  useNuxtApp,
  useState,
} from "#imports";
import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { emailHref, phoneHref } from "~/utils/contact";
import {
  addMonths,
  calendar,
  churchDate,
  dateOfDay,
  eventsOn,
  heldOn,
  minutes,
  pathOf,
  slugOf,
  toDate,
  toTime,
  week,
} from "~/utils/events";

/**
 * Today's date at the church, as `YYYY-MM-DD`. It is the server's until the
 * page is in a browser: a page rendered ahead of time says what day it was
 * then, and is put right once mounted. Everything that asks shares the one.
 */
export const useToday = (): Ref<string> => {
  const today = useState("events:today", () => churchDate(new Date()));

  onMounted(() => {
    today.value = churchDate(new Date());
  });

  return today;
};

/**
 * The events, in the route's locale: the events page's front matter is the
 * calendar, and it is read whichever page asks. An events page that cannot
 * be read has none.
 */
export const useEvents = async (): Promise<ComputedRef<ChurchEvent[]>> => {
  const { data } = await usePage("/events");

  return computed(() => data.value?.events ?? []);
};

/**
 * The events that repeat on a day of the week, from the earliest start:
 * what happens on a Sunday. One held in some weeks of the month only is
 * among them.
 */
export const useEventsHeldOn = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
  day: MaybeRefOrGetter<EventDay>,
): ComputedRef<ChurchEvent[]> =>
  computed(() => heldOn(toValue(events), toValue(day)));

/**
 * The days of this week, Sunday to Saturday, each with the events held on
 * it: the week today is in, whenever today is.
 */
export const useEventsThisWeek = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
): ComputedRef<CalendarDay[]> => {
  const today = useToday();

  return computed(() => week(toValue(events), today.value));
};

/**
 * The event the route names: one of the events, found by the slug the
 * address ends with. None when no event has it, or the events cannot be
 * read.
 */
export const useEvent = async (): Promise<
  ComputedRef<ChurchEvent | undefined>
> => {
  const { path } = useRouteLocale();
  const events = await useEvents();

  return computed(() => {
    const slug = path.value.split("/").pop();
    return events.value.find((event) => slugOf(event) === slug);
  });
};

/**
 * Says a date written `YYYY-MM-DD` in the route's locale, as the options
 * ask. A date is a day on the calendar and not a moment, so it is read
 * where it was written, in UTC.
 */
export const useEventDate = (options: Intl.DateTimeFormatOptions) => {
  const { locale } = useRouteLocale();

  const format = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, { ...options, timeZone: "UTC" }),
  );

  return (date: string): string => format.value.format(toDate(date));
};

/**
 * A time of day's formatter, in the route's locale. The time is formatted
 * as written — the church's own, whatever the visitor's zone.
 */
const useTimeFormat = () => {
  const { locale } = useRouteLocale();

  return computed(
    () =>
      new Intl.DateTimeFormat(locale.value, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }),
  );
};

/**
 * Says when an event starts, in the route's locale. An event whose start
 * cannot be read has no time to say.
 */
export const useEventStart = () => {
  const format = useTimeFormat();

  return (event: ChurchEvent): string | undefined => {
    const start = minutes(event.start);
    return start === null ? undefined : format.value.format(toTime(start));
  };
};

/**
 * Says when an event is held, in the route's locale: its start, and its end
 * when it has one. An event whose start cannot be read has no time to say.
 */
export const useEventTime = () => {
  const format = useTimeFormat();

  return (event: ChurchEvent): string | undefined => {
    const start = minutes(event.start);
    if (start === null) return undefined;
    const end = minutes(event.end);
    return end === null
      ? format.value.format(toTime(start))
      : format.value.formatRange(toTime(start), toTime(end));
  };
};

/**
 * Says which days an event is held on, in the route's locale: the one date
 * of an event held once, or the day of the week one repeats on — and, for
 * one held only in some of the month's weeks, which of them. An event with
 * neither a date nor a day has no days to say.
 */
export const useEventDays = () => {
  const { $t } = useNuxtApp();
  const { locale } = useRouteLocale();

  const date = useEventDate({ weekday: "long", month: "long", day: "numeric" });
  const weekday = useEventDate({ weekday: "long" });

  const list = computed(
    () => new Intl.ListFormat(locale.value, { type: "conjunction" }),
  );

  return (event: ChurchEvent): string | undefined => {
    if (event.date) return date(event.date.slice(0, 10));
    if (!event.day) return undefined;
    const day = weekday(dateOfDay(event.day));
    if (!event.weeks?.length) return $t.events.weekly({ day });
    const weeks = event.weeks
      .toSorted((a, b) => a - b)
      .map((week) => $t.events.week({ week }));
    return $t.events.monthly({ weeks: list.value.format(weeks), day });
  };
};

/** The way to an event's page, in the route's locale. */
export const useEventLink = () => {
  const { localize } = useRouteLocale();

  return (event: ChurchEvent): string => localize(pathOf(event));
};

/**
 * Sets an event as a list does: its title and note, when it is held, and
 * the way to its page.
 */
const useListing = () => {
  const link = useEventLink();
  const time = useEventTime();

  return (event: ChurchEvent): EventListing => ({
    title: event.title,
    note: event.note,
    time: time(event),
    to: link(event),
  });
};

/**
 * Events as a list sets them, in the order they were handed: what the
 * home page's callout and the invitation's schedule show.
 */
export const useEventListing = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
): ComputedRef<EventListing[]> => {
  const listing = useListing();

  return computed(() => toValue(events).map(listing));
};

/**
 * A week's days as the home page lists them: the days something is held
 * on, in order, each with its date in a few words — `Sun, Oct 4` — and its
 * events as a list sets them. A day nothing is held on has nothing to say,
 * and is left out.
 */
export const useEventWeek = (
  days: MaybeRefOrGetter<CalendarDay[]>,
): ComputedRef<DayListing[]> => {
  const date = useEventDate({
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const listing = useListing();

  return computed(() =>
    toValue(days)
      .filter((day) => day.events.length)
      .map((day) => ({
        date: day.date,
        label: date(day.date),
        events: day.events.map(listing),
      })),
  );
};

/**
 * What there is to know of an event: when it is held — its days, then its
 * time, whichever it says — where, and who to ask. An event that names no
 * place of its own is held at the church, and the church's office answers
 * questions about every event: its phone number to call, and its email to
 * write to.
 */
export const useEventDetails = (event: MaybeRefOrGetter<ChurchEvent>) => {
  const { contact } = useAppConfig();
  const days = useEventDays();
  const time = useEventTime();

  const when = computed(() =>
    [days(toValue(event)), time(toValue(event))].filter(
      (line) => line !== undefined,
    ),
  );

  const where = computed(() => toValue(event).location ?? contact.address);

  const questions = computed(() => [
    { text: contact.phone, href: phoneHref(contact.phone) },
    { text: contact.email, href: emailHref(contact.email) },
  ]);

  return { when, where, questions };
};

/**
 * The calendar, a month at a time: the month it shows, named in the route's
 * locale, headed by the days of the week, and its days each with the events
 * held on it. Until the visitor moves it, the month is today's, whenever
 * today is. The selected day is the page's to keep: `select` asks it to
 * select a day — and turns to the day's month when it is of a month beside
 * the one shown — and `reset` comes back to today and asks for it.
 */
export const useEventCalendar = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
  selected: MaybeRefOrGetter<string>,
  onSelect: (date: string) => void,
) => {
  const { $t } = useNuxtApp();
  const today = useToday();
  const link = useEventLink();
  const start = useEventStart();

  const month = useEventDate({ month: "long", year: "numeric" });
  const weekday = useEventDate({ weekday: "short" });
  const day = useEventDate({ weekday: "long", month: "long", day: "numeric" });

  // The month the calendar is showing, by a date in it.
  const moved = ref<string | null>(null);
  const shown = computed(() => moved.value ?? today.value);

  const move = (months: number) => {
    moved.value = addMonths(shown.value, months);
  };

  const select = (date: string) => {
    if (date.slice(0, 7) !== shown.value.slice(0, 7)) moved.value = date;
    onSelect(date);
  };

  const reset = () => {
    moved.value = null;
    onSelect(today.value);
  };

  const days = computed<CalendarCell[]>(() =>
    calendar(toValue(events), shown.value).map((cell) => ({
      date: cell.date,
      number: Number(cell.date.slice(8)),
      label: $t.events.day({ date: day(cell.date), count: cell.events.length }),
      events: cell.events.map((event) => ({
        title: event.title,
        time: start(event),
        to: link(event),
      })),
      today: cell.date === today.value,
      selected: cell.date === toValue(selected),
      // The month's weeks open and close with days of the months beside it.
      outside: cell.date.slice(0, 7) !== shown.value.slice(0, 7),
    })),
  );

  const weekdays = computed(() =>
    days.value.slice(0, 7).map((cell) => weekday(cell.date)),
  );

  const period = computed(() => month(shown.value));

  return { period, weekdays, days, move, select, reset };
};

/**
 * The day whose events the events page lists beside its calendar. Until the
 * visitor picks one, that is today, whenever today is: `selected` is the
 * day's date, to read and to set; `held` the events held on it, from the
 * earliest start; and `date` the day said in the route's locale.
 */
export const useSelectedDay = (events: MaybeRefOrGetter<ChurchEvent[]>) => {
  const today = useToday();
  const format = useEventDate({
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const picked = ref<string | null>(null);
  const selected = computed({
    get: () => picked.value ?? today.value,
    set: (date: string) => {
      picked.value = date;
    },
  });

  const held = computed(() => eventsOn(toValue(events), selected.value));
  const date = computed(() => format(selected.value));

  return { selected, held, date };
};

/**
 * An event's own page: what its header says under its name — the days it
 * is held on, its time, and its note, whichever of them it has — and its
 * picture, its page's or the church's until the page names one.
 */
export const useEventArticle = (
  event: MaybeRefOrGetter<ChurchEvent>,
  page: MaybeRefOrGetter<PageItem | null | undefined>,
) => {
  const { events: defaults } = useAppConfig();
  const days = useEventDays();
  const time = useEventTime();

  const description = computed(() => {
    const held = toValue(event);
    const said = [days(held), time(held), held.note].filter(Boolean);
    return said.length ? said.join(" · ") : undefined;
  });

  const image = computed(() => toValue(page)?.image ?? defaults.image);

  return { description, image };
};
