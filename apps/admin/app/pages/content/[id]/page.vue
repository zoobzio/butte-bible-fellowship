<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";

import { definePageMeta } from "#imports";

import ContentBody from "~/components/ContentBody.vue";
import ContentEditor from "~/components/ContentEditor.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["content:read"] } });

/*
 * The page, fetched by the page around this one, which names it, and is
 * told when its metadata is saved, to name it afresh.
 */
const { record } = defineProps<{ record: ContentRecord }>();

const emit = defineEmits<{ saved: [record: ContentRecord] }>();
</script>

<template>
  <div class="content-page">
    <ContentEditor :record="record" @saved="emit('saved', $event)" />
    <ContentBody :record="record" />
  </div>
</template>

<style>
/*
 * Two panels: the page's metadata, what its front matter was, in a narrow
 * column, and what is written on it in what is left. Narrow, one follows
 * the other.
 */
.content-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

/*
 * The narrow column keeps to the screen as the wide one scrolls. It is at
 * least as tall as the screen under the header and holds to the screen's
 * foot from the row's end: short, that is its head held under the header;
 * taller than the screen, it scrolls until its foot shows and stays there.
 */
.content-page > .content-editor {
  position: sticky;
  bottom: var(--space-5);
  align-self: end;
  align-content: start;
  min-height: calc(100dvh - var(--header-height) - 2 * var(--space-5));
}

@media (max-width: 60rem) {
  .content-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .content-page > .content-editor {
    position: static;
    min-height: 0;
  }
}
</style>
