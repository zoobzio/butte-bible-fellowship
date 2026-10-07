import type { Ref } from "vue";

import type { ChurchEvent } from "#shared/types/events";

import { computed, onMounted, useNuxtApp, useState } from "#imports";
import { useRouteLocale } from "~/composables/locale";
import { churchDate, dateOfDay, minutes, toDate, toTime } from "~/utils/events";

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
 * Says when an event is held, in the route's locale: its start, and its end
 * when it has one. The time is formatted as written — the church's own,
 * whatever the visitor's zone. An event whose start cannot be read has no
 * time to say.
 */
export const useEventTime = () => {
  const { locale } = useRouteLocale();

  const format = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      }),
  );

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

  // A date is a day on the calendar and not a moment, so it is read where
  // it was written, in UTC.
  const date = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }),
  );

  const weekday = computed(
    () =>
      new Intl.DateTimeFormat(locale.value, {
        weekday: "long",
        timeZone: "UTC",
      }),
  );

  const list = computed(
    () => new Intl.ListFormat(locale.value, { type: "conjunction" }),
  );

  return (event: ChurchEvent): string | undefined => {
    if (event.date) return date.value.format(toDate(event.date.slice(0, 10)));
    if (!event.day) return undefined;
    const day = weekday.value.format(toDate(dateOfDay(event.day)));
    if (!event.weeks?.length) return $t.events.weekly({ day });
    const weeks = event.weeks
      .toSorted((a, b) => a - b)
      .map((week) => $t.events.week({ week }));
    return $t.events.monthly({ weeks: list.value.format(weeks), day });
  };
};
