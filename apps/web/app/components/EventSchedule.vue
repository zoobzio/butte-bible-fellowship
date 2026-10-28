<script lang="ts">
import type { ChurchEvent } from "@bbf/schema/types";

import { NuxtLink } from "#components";
import { useNuxtApp } from "#imports";
import { useEventListing } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventSchedule" });

const { events } = defineProps<{ events: ChurchEvent[] }>();

const { $t } = useNuxtApp();
const listed = useEventListing(() => events);
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
.event-schedule {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: var(--space-4) var(--space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.event-schedule li {
  display: grid;
  padding: 0;
  line-height: 1.6;
}

.event-schedule li::before {
  content: none;
}

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
