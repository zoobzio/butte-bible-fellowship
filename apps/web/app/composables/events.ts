import type { Ref } from "vue";

import type { ChurchEvent } from "#shared/types/events";

import { computed, onMounted, useState } from "#imports";
import { useRouteLocale } from "~/composables/locale";
import { churchDate, minutes, toTime } from "~/utils/events";

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
