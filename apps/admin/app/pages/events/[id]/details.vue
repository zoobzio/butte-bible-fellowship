<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { definePageMeta } from "#imports";

import EventBody from "~/components/EventBody.vue";
import EventEditor from "~/components/EventEditor.vue";
import EventImage from "~/components/EventImage.vue";
import SaveBar from "~/components/SaveBar.vue";
import { useDrafts } from "~/composables/drafts";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

/*
 * The event, fetched by the page around this one, which names it, and is
 * told when its details are saved, to name it afresh.
 */
const { record } = defineProps<{ record: EventRecord }>();

const emit = defineEmits<{ saved: [record: EventRecord] }>();

/*
 * The record is saved and reset as a whole, from one bar at the foot of
 * the screen: each panel hands in its own part of it.
 */
const { dirty, open, saving, errors, save, reset } = useDrafts();
</script>

<template>
  <div class="event-page">
    <div class="event-page-side">
      <EventImage :record="record" />
      <EventEditor :record="record" @saved="emit('saved', $event)" />
    </div>
    <EventBody :record="record" />
    <SaveBar
      :dirty="dirty"
      :open="open"
      :saving="saving"
      :errors="errors"
      @save="save"
      @reset="reset"
    />
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

/*
 * The narrow column keeps to the screen as the wide one scrolls. It is at
 * least as tall as the screen under the header and holds to the screen's
 * foot from the row's end: short, that is its head held under the header;
 * taller than the screen, it scrolls until its foot shows and stays there.
 * The screen's foot is the bar that saves the record, which it clears.
 */
.event-page-side {
  position: sticky;
  bottom: calc(var(--action-bar-height) + var(--space-5));
  align-self: end;
  align-content: start;
  min-height: calc(
    100dvh - var(--header-height) - var(--action-bar-height) - 2 *
      var(--space-5)
  );
}

@media (max-width: 60rem) {
  .event-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .event-page-side {
    position: static;
    min-height: 0;
  }
}
</style>
