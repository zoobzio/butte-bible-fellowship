<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";
import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import { definePageMeta, ref } from "#imports";

import TableOfContents from "#layers/bbf/app/components/TableOfContents.vue";
import ContentBody from "~/components/ContentBody.vue";
import ContentEditor from "~/components/ContentEditor.vue";
import SaveBar from "~/components/SaveBar.vue";
import { useDrafts } from "~/composables/drafts";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["content:read"] } });

/*
 * The page, fetched by the page around this one, which names it, and is
 * told when its metadata is saved, to name it afresh.
 */
const { record } = defineProps<{ record: ContentRecord }>();

const emit = defineEmits<{ saved: [record: ContentRecord] }>();

/*
 * The record is saved and reset as a whole, from one bar at the foot of
 * the screen: each panel hands in its own part of it.
 */
const { dirty, open, saving, errors, save, reset } = useDrafts();

/*
 * The page's table of contents, as the site lists it, which the writing
 * tells as it is written: under the metadata, to move about the page by.
 */
const contents = ref<OutlineEntry[]>([]);
</script>

<template>
  <div class="content-page">
    <div class="content-page-side">
      <ContentEditor :record="record" @saved="emit('saved', $event)" />
      <TableOfContents :entries="contents" />
    </div>
    <ContentBody :record="record" @outline="contents = $event" />
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
 * Two panels: the page's metadata, what its front matter was, over its
 * table of contents in a narrow column, and what is written on it in what
 * is left. Narrow, one follows the other.
 */
.content-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.content-page-side {
  display: grid;
  gap: var(--space-7);
  min-width: 0;
}

/*
 * The narrow column keeps to the screen as the wide one scrolls. It is at
 * least as tall as the screen under the header and holds to the screen's
 * foot from the row's end: short, that is its head held under the header;
 * taller than the screen, it scrolls until its foot shows and stays there.
 * The screen's foot is the bar that saves the record, which it clears.
 */
.content-page-side {
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
  .content-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .content-page-side {
    position: static;
    min-height: 0;
  }
}
</style>
