<script lang="ts">
import type { ChurchEvent } from "@bbf/validators/types";

import { useNuxtApp } from "#imports";

import EventCalendar from "~/components/EventCalendar.vue";
import EventList from "~/components/EventList.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useSelectedDay } from "~/composables/events";
</script>

<script setup lang="ts">
defineOptions({ name: "EventsBrowser" });

// The events page's front matter is the calendar: an editor lists the
// events there. A page that lists none has an empty calendar.
const { events = [] } = defineProps<{ events?: ChurchEvent[] }>();

const { $t } = useNuxtApp();
const { selected, held, date } = useSelectedDay(() => events);
</script>

<template>
  <div class="events">
    <PageHeader
      :title="$t.events.title()"
      :description="$t.events.description()"
    />
    <EventCalendar v-model:selected="selected" :events="events" />
    <aside class="events-day" aria-live="polite">
      <h2>
        <span>{{ $t.events.selected() }}</span>
        <time :datetime="selected">{{ date }}</time>
      </h2>
      <EventList :events="held" />
    </aside>
  </div>
</template>

<style>
/* The about page's two columns, the other way round: the calendar where the
   article is, and the selected day's events where the contents are. */
.events {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: start;
  gap: clamp(var(--space-5), 3vw, var(--space-7));
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

/* The header runs the width of both columns. */
.events .page-header {
  grid-column: 1 / -1;
}

.events .event-calendar {
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

/* Rides down the page with the reader once it meets the header, and
   scrolls on its own when it is taller than the room under it. */
.events-day {
  position: sticky;
  top: var(--header-height);
  max-height: calc(100dvh - var(--header-height));
  overflow-y: auto;
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

/* The day's date, under a label like the one over a page's contents. */
.events-day h2 {
  display: grid;
  gap: var(--space-1);
  margin: 0 0 var(--space-5);
  font: var(--type-title);
  font-family: var(--font-display);
  letter-spacing: var(--type-title-letter-spacing);
}

.events-day h2::before {
  content: none;
}

.events-day h2 span {
  font-size: var(--label-size);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--primary);
}

/* No room for a column beside the calendar: the day's events follow it. */
@media (max-width: 60rem) {
  .events {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .events .event-calendar {
    padding-bottom: 0;
  }
  .events-day {
    position: static;
    max-height: none;
  }
}
</style>
