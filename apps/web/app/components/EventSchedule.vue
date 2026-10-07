<script lang="ts">
import type { ChurchEvent } from "#shared/types/events";

import { NuxtLink } from "#components";
import { computed, useNuxtApp } from "#imports";
import { useEventTime } from "~/composables/events";
import { useRouteLocale } from "~/composables/locale";
import { pathOf } from "~/utils/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventSchedule" });

// What happens, in the order it does.
const { events } = defineProps<{ events: ChurchEvent[] }>();

const { $t } = useNuxtApp();
const { localize } = useRouteLocale();
const time = useEventTime();

const listed = computed(() =>
  events.map((event) => ({
    title: event.title,
    time: time(event),
    to: localize(pathOf(event)),
  })),
);
</script>

<template>
  <ol v-if="listed.length" class="event-schedule">
    <li v-for="(event, index) in listed" :key="index">
      <NuxtLink :to="event.to">{{ event.title }}</NuxtLink>
      <span v-if="event.time" class="event-schedule-time">
        {{ event.time }}
      </span>
    </li>
  </ol>
  <p v-else class="event-schedule-none">{{ $t.events.none() }}</p>
</template>

<style>
/* A day at a glance: its events side by side across the room there is,
   as many to a row as fit, each with its time under its title. */
.event-schedule {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: var(--space-4) var(--space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* The design system rules every list item with a dash: these are not. */
.event-schedule li {
  display: grid;
  padding: 0;
  line-height: 1.6;
}

.event-schedule li::before {
  content: none;
}

/* The title is the way to the event's page: it reads as a title until it
   is pointed at. */
.event-schedule a {
  color: var(--on-surface-high-contrast);
  text-decoration-color: transparent;
}

.event-schedule a:hover {
  color: var(--primary-high-contrast);
  text-decoration-color: currentColor;
}

.event-schedule-time {
  font-size: var(--label-size);
  font-variant-numeric: tabular-nums;
  color: var(--on-surface);
}

.event-schedule-none {
  margin: 0;
  color: var(--on-surface-muted);
}
</style>
