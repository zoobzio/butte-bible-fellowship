<script lang="ts">
import type { ChurchEvent } from "#shared/types/events";

import { Icon, NuxtLink } from "#components";
import { computed, ref, useNuxtApp } from "#imports";
import { useToday } from "~/composables/events";
import { useRouteLocale } from "~/composables/locale";
import {
  addMonths,
  calendar,
  minutes,
  pathOf,
  toDate,
  toTime,
} from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventCalendar" });

// The selected day is the page's to keep: it lists that day's events.
const { events, selected } = defineProps<{
  events: ChurchEvent[];
  /** The selected day's date, as `YYYY-MM-DD`. */
  selected: string;
}>();

const emit = defineEmits<{ "update:selected": [date: string] }>();

const { $t } = useNuxtApp();
const { locale, localize } = useRouteLocale();
const today = useToday();

// The month the calendar is showing, by a date in it. Until the visitor
// moves it, that is today's, whenever today is.
const moved = ref<string | null>(null);
const shown = computed(() => moved.value ?? today.value);

const move = (months: number) => {
  moved.value = addMonths(shown.value, months);
};

// A day of a month beside the one shown brings its month with it.
const select = (date: string) => {
  if (date.slice(0, 7) !== shown.value.slice(0, 7)) moved.value = date;
  emit("update:selected", date);
};

const reset = () => {
  moved.value = null;
  emit("update:selected", today.value);
};

// Every date is formatted in UTC, where the calendar's dates are kept.
const format = (options: Intl.DateTimeFormatOptions) =>
  computed(
    () =>
      new Intl.DateTimeFormat(locale.value, { ...options, timeZone: "UTC" }),
  );

const monthFormat = format({ month: "long", year: "numeric" });
const weekdayFormat = format({ weekday: "short" });
const dayFormat = format({ weekday: "long", month: "long", day: "numeric" });
const timeFormat = format({ hour: "numeric", minute: "2-digit" });

/** When an event starts, as written: the church's own time. */
const startOf = (event: ChurchEvent) => {
  const start = minutes(event.start);
  return start === null ? undefined : timeFormat.value.format(toTime(start));
};

const days = computed(() =>
  calendar(events, shown.value).map((day) => ({
    date: day.date,
    number: Number(day.date.slice(8)),
    label: $t.events.day({
      date: dayFormat.value.format(toDate(day.date)),
      count: day.events.length,
    }),
    events: day.events.map((event) => ({
      title: event.title,
      time: startOf(event),
      to: localize(pathOf(event)),
    })),
    today: day.date === today.value,
    selected: day.date === selected,
    // The month's weeks open and close with days of the months beside it.
    outside: day.date.slice(0, 7) !== shown.value.slice(0, 7),
  })),
);

const weekdays = computed(() =>
  days.value
    .slice(0, 7)
    .map((day) => weekdayFormat.value.format(toDate(day.date))),
);

const period = computed(() => monthFormat.value.format(toDate(shown.value)));
</script>

<template>
  <section class="event-calendar" :aria-label="$t.events.calendar()">
    <div class="event-calendar-bar">
      <h2 class="event-calendar-period" aria-live="polite">{{ period }}</h2>
      <div class="event-calendar-controls">
        <button
          type="button"
          class="event-calendar-button"
          :aria-label="$t.events.previousMonth()"
          @click="move(-1)"
        >
          <Icon name="chevron-left" class="icon" />
        </button>
        <button type="button" class="event-calendar-button" @click="reset">
          {{ $t.events.today() }}
        </button>
        <button
          type="button"
          class="event-calendar-button"
          :aria-label="$t.events.nextMonth()"
          @click="move(1)"
        >
          <Icon name="chevron-right" class="icon" />
        </button>
      </div>
    </div>
    <div class="event-calendar-grid">
      <ol class="event-calendar-weekdays" aria-hidden="true">
        <li v-for="weekday in weekdays" :key="weekday">{{ weekday }}</li>
      </ol>
      <ol class="event-calendar-days">
        <li
          v-for="day in days"
          :key="day.date"
          class="event-calendar-day"
          :data-outside="day.outside ? '' : undefined"
          :data-selected="day.selected ? '' : undefined"
        >
          <button
            type="button"
            class="event-calendar-date"
            :aria-label="day.label"
            :aria-pressed="day.selected"
            :aria-current="day.today ? 'date' : undefined"
            @click="select(day.date)"
          >
            <time :datetime="day.date">{{ day.number }}</time>
          </button>
          <ul v-if="day.events.length" class="event-calendar-events">
            <li v-for="(event, index) in day.events" :key="index">
              <NuxtLink :to="event.to" class="event-calendar-event">
                <span v-if="event.time" class="event-calendar-event-time">
                  {{ event.time }}
                </span>
                {{ event.title }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>

<style>
/* ---------- The bar — the month showing, and the way to another ------- */

.event-calendar-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.event-calendar-period {
  display: block;
  margin: 0;
  font: var(--type-headline);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 3vw, var(--headline-size));
  letter-spacing: var(--type-headline-letter-spacing);
}

.event-calendar-period::before {
  content: none;
}

.event-calendar-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Every button is as tall as an arrow's: its icon, the room around it and
   its border. */
.event-calendar-button {
  display: inline-flex;
  align-items: center;
  height: calc(var(--space-4) + var(--space-2) * 2 + 2px);
  padding: 0 var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: transparent;
  color: var(--on-surface-muted);
  font: var(--type-label);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
  transition:
    color var(--transition-base),
    border-color var(--transition-base),
    background var(--transition-base);
}

/* An arrow alone: as tall as it is wide. */
.event-calendar-button:has(.icon) {
  padding: 0 var(--space-2);
}

.event-calendar-button:hover {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
  background: color-mix(in oklab, var(--primary-container) 30%, transparent);
}

.event-calendar-button .icon {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}

/* ---------- The grid — seven days across ------------------------------ */

.event-calendar-weekdays,
.event-calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The design system rules every list item with a dash: not these. */
.event-calendar li {
  padding-left: 0;
  line-height: inherit;
}

.event-calendar li::before {
  content: none;
}

/* The grid is one framed box: the days of the week along its top, on the
   wash the day's card is painted with, and the days under them. */
.event-calendar-grid {
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-lg);
  box-shadow: var(--elevation-low);
}

.event-calendar-weekdays {
  border-bottom: 1px var(--stroke-solid) var(--rule);
  background: color-mix(
    in oklab,
    var(--secondary-container) 40%,
    var(--surface-container)
  );
}

.event-calendar-weekdays li {
  padding: var(--space-2);
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

/* One line between every two days: each day rules its right and bottom,
   and the frame takes the last of each. */
.event-calendar-days > li {
  border: 1px var(--stroke-solid) var(--rule);
  border-width: 0 1px 1px 0;
}

.event-calendar-days > li:nth-child(7n) {
  border-right: 0;
}

.event-calendar-days > li:nth-last-child(-n + 7) {
  border-bottom: 0;
}

/* A day holds its number and, under it, a line for each event held on it.
   It is as tall as the tallest day of its week, so the lines between the
   days always meet. */
.event-calendar .event-calendar-day {
  position: relative;
  display: flow-root;
  min-width: 0;
  padding: var(--space-2);
  transition: background var(--transition-fast);
}

/* A strut as tall as the day is wide keeps a day at least a square, and
   lets it be taller: an aspect ratio on the day itself would hold it to the
   square while a fuller day beside it stretched the week. */
.event-calendar .event-calendar-day::before {
  content: "";
  float: left;
  width: 0;
  padding-bottom: 100%;
}

.event-calendar-day:hover {
  background: color-mix(in oklab, var(--primary-container) 30%, transparent);
}

/* A day of a month beside the one shown is on the same wash as the days of
   the week. */
.event-calendar-day[data-outside] {
  background: color-mix(
    in oklab,
    var(--secondary-container) 40%,
    var(--surface-container)
  );
}

.event-calendar-day[data-selected] {
  background: color-mix(in oklab, var(--primary-container) 60%, transparent);
}

/* The day's number is the button that selects it, and the button reaches
   over the whole day: anywhere on it that is not an event selects it. */
.event-calendar-date {
  display: grid;
  place-items: center;
  width: fit-content;
  min-width: var(--space-6);
  height: var(--space-6);
  margin-bottom: var(--space-1);
  padding: 0;
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
}

.event-calendar-date::after {
  content: "";
  position: absolute;
  inset: 0;
}

.event-calendar-day[data-outside] .event-calendar-date {
  color: var(--on-surface-muted);
}

/* Today is ringed, and filled once it is the day selected. */
.event-calendar-date[aria-current] {
  box-shadow: inset 0 0 0 1px var(--primary);
  color: var(--primary);
  font-weight: var(--weight-medium);
}

.event-calendar .event-calendar-date[aria-pressed="true"] {
  background: var(--primary);
  color: var(--on-primary);
  font-weight: var(--weight-medium);
}

/* The events sit over the day's button, so each is its own link. */
.event-calendar-events {
  position: relative;
  display: grid;
  gap: calc(var(--space-1) / 2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-calendar-events li {
  min-width: 0;
}

/* One line each, however long the title: what does not fit is cut short. */
.event-calendar-event {
  display: block;
  overflow: hidden;
  font-size: calc(var(--label-size) * 0.9);
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--on-surface-high-contrast);
  text-decoration: none;
}

.event-calendar-event:hover {
  color: var(--primary-high-contrast);
  text-decoration: underline;
}

.event-calendar-event-time {
  color: var(--primary);
  font-variant-numeric: tabular-nums;
}

.event-calendar-day[data-outside] .event-calendar-events {
  opacity: 0.55;
}

/* A phone's days are too small for words: each event is a bar, the day is
   pressed whole, and the events are read — and followed — from its list. */
@media (max-width: 30rem) {
  .event-calendar .event-calendar-day {
    padding: var(--space-1);
  }

  .event-calendar-events {
    gap: var(--space-1);
    padding-inline: var(--space-1);
    pointer-events: none;
  }

  .event-calendar-event {
    height: 3px;
    border-radius: var(--shape-full);
    background: var(--primary);
    font-size: 0;
  }
}
</style>
