<script lang="ts">
import type { CalendarDay } from "~/types/events";

import { NuxtLink } from "#components";
import { useNuxtApp } from "#imports";
import { useEventWeek } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventWeek" });

const { days } = defineProps<{ days: CalendarDay[] }>();

const { $t } = useNuxtApp();
const listed = useEventWeek(() => days);
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
.event-week {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  gap: var(--space-6) var(--space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-week li {
  padding: 0;
  line-height: 1.6;
}

.event-week li::before {
  content: none;
}

.event-week > li {
  display: grid;
  gap: var(--space-3);
  align-content: start;
}

.event-week time {
  display: block;
  padding-bottom: var(--space-2);
  border-bottom: 1px var(--stroke-solid) var(--rule);
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

.event-week ul {
  gap: var(--space-3);
  margin: 0;
  padding: 0;
}

.event-week ul li {
  display: grid;
}

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
  color: var(--on-surface);
}

.event-week-none {
  margin: 0;
  color: var(--on-surface-muted);
}
</style>
