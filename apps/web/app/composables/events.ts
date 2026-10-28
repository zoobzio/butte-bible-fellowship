import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";

import type {
  CalendarCell,
  CalendarDay,
  DayListing,
  EventListing,
} from "~/types/events";
import type { PageItem } from "~/types/page";

import type { ChurchEvent, EventDay } from "@bbf/schema/types";

import {
  computed,
  onMounted,
  ref,
  toValue,
  useAppConfig,
  useLocale,
  useNuxtApp,
  useRoute,
  useState,
} from "#imports";
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

export const useToday = (): Ref<string> => {
  const today = useState("events:today", () => churchDate(new Date()));

  onMounted(() => {
    today.value = churchDate(new Date());
  });

  return today;
};

export const useEvents = async (): Promise<ComputedRef<ChurchEvent[]>> => {
  const { data } = await usePage("/events");

  return computed(() => data.value?.events ?? []);
};

export const useEventsHeldOn = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
  day: MaybeRefOrGetter<EventDay>,
): ComputedRef<ChurchEvent[]> =>
  computed(() => heldOn(toValue(events), toValue(day)));

export const useEventsThisWeek = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
): ComputedRef<CalendarDay[]> => {
  const today = useToday();

  return computed(() => week(toValue(events), today.value));
};

export const useEvent = async (): Promise<
  ComputedRef<ChurchEvent | undefined>
> => {
  const route = useRoute();
  const events = await useEvents();

  return computed(() => {
    const slug = route.path.split("/").pop();
    return events.value.find((event) => slugOf(event) === slug);
  });
};

export const useEventDate = (options: Intl.DateTimeFormatOptions) => {
  const { locale } = useLocale();

  const format = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, { ...options, timeZone: "UTC" }),
  );

  return (date: string): string => format.value.format(toDate(date));
};

// ICU builds differ in their spaces. Plain spaces keep server and browser output the same.
const plain = (text: string): string => text.replace(/\s/g, " ");

const useTimeFormat = () => {
  const { locale } = useLocale();

  const formatter = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }),
  );

  return {
    format: (time: Date): string => plain(formatter.value.format(time)),
    formatRange: (start: Date, end: Date): string =>
      plain(formatter.value.formatRange(start, end)),
  };
};

export const useEventStart = () => {
  const format = useTimeFormat();

  return (event: ChurchEvent): string | undefined => {
    const start = minutes(event.start);
    return start === null ? undefined : format.format(toTime(start));
  };
};

export const useEventTime = () => {
  const format = useTimeFormat();

  return (event: ChurchEvent): string | undefined => {
    const start = minutes(event.start);
    if (start === null) return undefined;
    const end = minutes(event.end);
    return end === null
      ? format.format(toTime(start))
      : format.formatRange(toTime(start), toTime(end));
  };
};

export const useEventDays = () => {
  const { $t } = useNuxtApp();
  const { locale } = useLocale();

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

export const useEventLink = () => {
  return (event: ChurchEvent): string => pathOf(event);
};

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

export const useEventListing = (
  events: MaybeRefOrGetter<ChurchEvent[]>,
): ComputedRef<EventListing[]> => {
  const listing = useListing();

  return computed(() => toValue(events).map(listing));
};

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
      outside: cell.date.slice(0, 7) !== shown.value.slice(0, 7),
    })),
  );

  const weekdays = computed(() =>
    days.value.slice(0, 7).map((cell) => weekday(cell.date)),
  );

  const period = computed(() => month(shown.value));

  return { period, weekdays, days, move, select, reset };
};

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
