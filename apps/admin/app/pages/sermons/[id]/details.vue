<script lang="ts">
import type { SermonDetail } from "@bbf/schema/types";

import { definePageMeta, useId, useNuxtApp } from "#imports";

import SermonDetails from "~/components/SermonDetails.vue";
import { PLAYER_ALLOW, embed } from "~/constants/sermons";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["sermons:read"] } });

/* The sermon, fetched by the page around this one, which names it. */
const { record } = defineProps<{ record: SermonDetail }>();

const { $t } = useNuxtApp();

const recording = useId();
const written = useId();
</script>

<template>
  <div class="sermon-page">
    <div class="sermon-page-side">
      <SermonDetails :record="record" />
    </div>
    <div class="sermon-page-main">
      <!--
        The recording plays here, in YouTube's own player. A sermon with
        none keeps the frame, which says so.
      -->
      <section class="sermon-recording" :aria-labelledby="recording">
        <h2 :id="recording" class="sermon-page-title">
          {{ $t.admin.sermon.recording() }}
        </h2>
        <div class="sermon-recording-frame">
          <iframe
            v-if="record.video"
            :src="embed(record.video)"
            :title="record.title"
            :allow="PLAYER_ALLOW"
            allowfullscreen
          />
          <p v-else>{{ $t.admin.sermon.unrecorded() }}</p>
        </div>
      </section>
      <!-- What is written about it, as it was written: read here, not changed. -->
      <section class="sermon-body" :aria-labelledby="written">
        <h2 :id="written" class="sermon-page-title">
          {{ $t.admin.sermon.body() }}
        </h2>
        <p v-if="record.body" class="sermon-body-text">{{ record.body }}</p>
        <p v-else class="sermon-body-empty">
          {{ $t.admin.sermon.bodyEmpty() }}
        </p>
      </section>
    </div>
  </div>
</template>

<style>
/*
 * Two panels: the sermon's details in a narrow column, and its recording,
 * over what is written about it, in what is left. Narrow, one follows the
 * other.
 */
.sermon-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.sermon-page-side {
  min-width: 0;
}

.sermon-page-main {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
}

.sermon-recording,
.sermon-body {
  display: grid;
  gap: var(--space-3);
}

/* A panel's heading, small and muted, as a field's label is. */
.sermon-page-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.sermon-page-title::before {
  content: none;
}

/* The player's frame, the shape of a recording, whatever fills it. */
.sermon-recording-frame {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-md);
  background: var(--surface-container);
  color: var(--on-surface-muted);
}

.sermon-recording-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.sermon-recording-frame p {
  margin: 0;
}

/* What is written keeps its own lines, and wraps within the panel. */
.sermon-body-text {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.sermon-body-empty {
  margin: 0;
  color: var(--on-surface-muted);
}

@media (max-width: 60rem) {
  .sermon-page {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
