<script lang="ts">
import type { ChurchEvent } from "#shared/types/events";

import { NuxtLink } from "#components";
import { computed, useNuxtApp } from "#imports";
import { useRouteLocale } from "~/composables/locale";
import { minutes, pathOf, toTime } from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventList" });

// A day's events, in the order they are to be listed.
const { events } = defineProps<{ events: ChurchEvent[] }>();

const { $t } = useNuxtApp();
const { locale, localize } = useRouteLocale();

// When an event is held: its start, and its end when it has one. The time
// is formatted as written — the church's own, whatever the visitor's zone.
const timeFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }),
);

const time = (event: ChurchEvent) => {
  const start = minutes(event.start);
  if (start === null) return undefined;
  const end = minutes(event.end);
  return end === null
    ? timeFormat.value.format(toTime(start))
    : timeFormat.value.formatRange(toTime(start), toTime(end));
};

const listed = computed(() =>
  events.map((event) => ({
    title: event.title,
    note: event.note,
    time: time(event),
    to: localize(pathOf(event)),
  })),
);
</script>

<template>
  <div class="event-list">
    <ol v-if="listed.length">
      <li v-for="(event, index) in listed" :key="index">
        <h3>
          <NuxtLink :to="event.to">{{ event.title }}</NuxtLink>
        </h3>
        <p v-if="event.time" class="event-list-time">{{ event.time }}</p>
        <p v-if="event.note" class="event-list-note">{{ event.note }}</p>
      </li>
    </ol>
    <p v-else class="event-list-none">{{ $t.events.none() }}</p>
  </div>
</template>

<style>
/* The home page's callout, holding the day's events one under another. */
.event-list {
  position: relative;
  overflow: hidden;
  padding: var(--space-5) var(--space-5) var(--space-5) var(--space-6);
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 40%, var(--outline-muted));
  border-radius: var(--shape-lg);
  background:
    linear-gradient(
      150deg,
      color-mix(in oklab, var(--secondary-container) 40%, transparent),
      transparent 70%
    ),
    var(--surface-container);
}

.event-list::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
}

.event-list ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The design system rules every list item with a dash: these are ruled
   off from one another instead. */
.event-list li {
  padding: var(--space-4) 0;
  border-top: 1px var(--stroke-solid) var(--outline-muted);
  line-height: inherit;
}

.event-list li::before {
  content: none;
}

.event-list li:first-child {
  padding-top: 0;
  border-top: 0;
}

.event-list li:last-child {
  padding-bottom: 0;
}

.event-list h3 {
  margin: 0 0 var(--space-1);
  font: var(--type-title);
  font-family: var(--font-display);
  font-style: normal;
  letter-spacing: var(--type-title-letter-spacing);
  color: var(--on-surface-high-contrast);
}

/* The title is the way to the event's page: it reads as a title until it
   is pointed at. */
.event-list h3 a {
  color: inherit;
  text-decoration-color: transparent;
}

.event-list h3 a:hover {
  color: var(--primary-high-contrast);
  text-decoration-color: currentColor;
}

.event-list p {
  margin: 0;
  line-height: 1.6;
}

.event-list-time {
  color: var(--on-surface-high-contrast);
  font-variant-numeric: tabular-nums;
}

.event-list-note,
.event-list-none {
  color: var(--on-surface-muted-medium-contrast);
}
</style>
