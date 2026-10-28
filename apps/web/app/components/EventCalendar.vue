<script lang="ts">
import type { ChurchEvent } from "@bbf/schema/types";

import { Icon, NuxtLink } from "#components";
import { useNuxtApp } from "#imports";
import { useEventCalendar } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventCalendar" });

const { events, selected } = defineProps<{
  events: ChurchEvent[];
  selected: string;
}>();

const emit = defineEmits<{ "update:selected": [date: string] }>();

const { $t } = useNuxtApp();

const { period, weekdays, days, move, select, reset } = useEventCalendar(
  () => events,
  () => selected,
  (date) => emit("update:selected", date),
);
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

.event-calendar-weekdays,
.event-calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-calendar li {
  padding-left: 0;
  line-height: inherit;
}

.event-calendar li::before {
  content: none;
}

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

.event-calendar .event-calendar-day {
  position: relative;
  display: flow-root;
  min-width: 0;
  padding: var(--space-2);
  transition: background var(--transition-fast);
}

/* Do not use aspect-ratio here. A day must grow taller than a square. */
.event-calendar .event-calendar-day::before {
  content: "";
  float: left;
  width: 0;
  padding-bottom: 100%;
}

.event-calendar-day:hover {
  background: color-mix(in oklab, var(--primary-container) 30%, transparent);
}

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
