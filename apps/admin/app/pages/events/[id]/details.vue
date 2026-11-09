<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { definePageMeta } from "#imports";

import EventBody from "~/components/EventBody.vue";
import EventEditor from "~/components/EventEditor.vue";
import EventImage from "~/components/EventImage.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

/*
 * The event, fetched by the page around this one, which names it, and is
 * told when its details are saved, to name it afresh.
 */
const { record } = defineProps<{ record: EventRecord }>();

const emit = defineEmits<{ saved: [record: EventRecord] }>();
</script>

<template>
  <div class="event-page">
    <div class="event-page-side">
      <EventImage :record="record" />
      <EventEditor :record="record" @saved="emit('saved', $event)" />
    </div>
    <EventBody :record="record" />
  </div>
</template>

<style>
/*
 * Two panels: the event's picture over its details in a narrow column,
 * and what is written about it in what is left. Narrow, one follows the
 * other.
 */
.event-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.event-page-side {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

@media (max-width: 60rem) {
  .event-page {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
