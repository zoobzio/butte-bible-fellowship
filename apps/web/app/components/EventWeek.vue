<script lang="ts">
import type { CalendarDay } from "~/types/events";

import { NuxtLink } from "#components";
import { computed, useNuxtApp } from "#imports";
import { useEventTime } from "~/composables/events";
import { useRouteLocale } from "~/composables/locale";
import { pathOf, toDate } from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventWeek" });

// A week's days, in order, each with the events held on it.
const { days } = defineProps<{ days: CalendarDay[] }>();

const { $t } = useNuxtApp();
const { locale, localize } = useRouteLocale();
const time = useEventTime();

// A day's date in a few words: `Sun, Oct 4`. A date is a day on the
// calendar and not a moment, so it is read where it was written, in UTC.
const dateFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
);

// A day nothing is held on has nothing to say, and is left out.
const listed = computed(() =>
  days
    .filter((day) => day.events.length)
    .map((day) => ({
      date: day.date,
      label: dateFormat.value.format(toDate(day.date)),
      events: day.events.map((event) => ({
        title: event.title,
        time: time(event),
        to: localize(pathOf(event)),
      })),
    })),
);
</script>

<template>
  <ol v-if="listed.length" class="event-week">
    <li v-for="day in listed" :key="day.date">
      <time :datetime="day.date">{{ day.label }}</time>
      <ul>
        <li v-for="(event, index) in day.events" :key="index">
          <NuxtLink :to="event.to">{{ event.title }}</NuxtLink>
          <span v-if="event.time" class="event-week-time">
            {{ event.time }}
          </span>
        </li>
      </ul>
    </li>
  </ol>
  <p v-else class="event-week-none">{{ $t.events.none() }}</p>
</template>

<style>
/* A week at a glance: each day's date, and beside it what is held then. */
.event-week {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The design system rules every list item with a dash: the days are ruled
   off from one another instead, and their events not at all. */
.event-week li {
  padding: 0;
  line-height: 1.6;
}

.event-week li::before {
  content: none;
}

.event-week > li {
  display: grid;
  grid-template-columns: 6.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: var(--space-1) var(--space-4);
  padding-block: var(--space-3);
  border-top: 1px var(--stroke-solid) var(--outline-muted);
}

.event-week > li:first-child {
  padding-top: 0;
  border-top: 0;
}

.event-week > li:last-child {
  padding-bottom: 0;
}

.event-week time {
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary-medium-contrast);
}

.event-week ul {
  gap: var(--space-1);
  margin: 0;
  padding: 0;
}

/* An event's title, and when it is held at the row's far end. */
.event-week ul li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0 var(--space-4);
}

/* The title is the way to the event's page: it reads as a title until it
   is pointed at. */
.event-week a {
  color: var(--on-surface-high-contrast);
  text-decoration-color: transparent;
}

.event-week a:hover {
  color: var(--primary-high-contrast);
  text-decoration-color: currentColor;
}

.event-week-time {
  font-size: var(--label-size);
  font-variant-numeric: tabular-nums;
  color: var(--on-surface-medium-contrast);
}

.event-week-none {
  margin: 0;
  color: var(--on-surface-muted-medium-contrast);
}

/* No room for the date beside its events: it heads them. */
@media (max-width: 30rem) {
  .event-week > li {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
