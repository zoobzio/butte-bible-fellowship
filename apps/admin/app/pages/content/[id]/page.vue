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

@media (max-width: 60rem) {
  .content-page {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
