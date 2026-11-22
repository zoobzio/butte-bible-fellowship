<script lang="ts">
import type { PersonRecord } from "@bbf/schema/types";
import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import { definePageMeta, ref } from "#imports";

import TableOfContents from "#layers/bbf/app/components/TableOfContents.vue";
import SaveBar from "~/components/SaveBar.vue";
import PersonBio from "~/components/PersonBio.vue";
import PersonEditor from "~/components/PersonEditor.vue";
import { useDrafts } from "~/composables/drafts";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["people:read"] } });

/*
 * The person, fetched by the page around this one, which names them, and
 * is told when their details are saved, to name them afresh.
 */
const { record } = defineProps<{ record: PersonRecord }>();

const emit = defineEmits<{ saved: [record: PersonRecord] }>();

/*
 * The record is saved and reset as a whole, from one bar at the foot of
 * the screen: each panel hands in its own part of it.
 */
const { dirty, open, saving, errors, save, reset } = useDrafts();

/*
 * The bio's table of contents, which the bio tells as it is written:
 * under the person's details, to move about it by.
 */
const contents = ref<OutlineEntry[]>([]);
</script>

<template>
  <div class="person-page">
    <div class="person-page-side">
      <PersonEditor :record="record" @saved="emit('saved', $event)" />
      <TableOfContents :entries="contents" />
    </div>
    <PersonBio :record="record" @outline="contents = $event" />
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
 * Two panels: the person's details, their photo among them, and their bio's
 * table of contents in a narrow column, and their bio in what is left. Narrow,
 * one follows the other.
 */
.person-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.person-page-side {
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
.person-page-side {
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
  .person-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .person-page-side {
    position: static;
    min-height: 0;
  }
}
</style>
