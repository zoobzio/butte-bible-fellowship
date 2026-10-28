<script lang="ts">
import { NuxtLink } from "#components";
import { useNuxtApp } from "#imports";

import EventWeek from "~/components/EventWeek.vue";
import { useEvents, useEventsThisWeek } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "HomeWeek" });

const { $t } = useNuxtApp();

// This week's events, day by day, and the way on to every event.
const events = await useEvents();
const days = useEventsThisWeek(events);
</script>

<template>
  <section class="home-week">
    <h2>{{ $t.events.thisWeek() }}</h2>
    <EventWeek :days="days" />
    <NuxtLink to="/events" class="cta">
      {{ $t.events.all() }}
    </NuxtLink>
  </section>
</template>

<style>
/* The article's own padding has already set the week off from it. */
.home-week h2 {
  margin-top: 0;
}

.home-week .event-week {
  margin-top: var(--space-6);
}

.home-week .cta {
  margin-top: var(--space-7);
}
</style>
