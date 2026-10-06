<script lang="ts">
import type { Sermon } from "#shared/types/sermons";

import { NuxtLink } from "#components";
import { useNuxtApp, useRuntimeConfig } from "#imports";

import SermonCard from "~/components/SermonCard.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "SermonGrid" });

const { sermons } = defineProps<{ sermons: Sermon[] }>();

const { $t } = useNuxtApp();
const { channel } = useRuntimeConfig().public.youtube;
</script>

<template>
  <section class="sermon-grid">
    <div v-if="sermons.length" class="sermon-grid-list">
      <SermonCard v-for="sermon in sermons" :key="sermon.id" :sermon="sermon" />
    </div>
    <NuxtLink
      :to="`https://www.youtube.com/channel/${channel}/videos`"
      target="_blank"
      class="cta"
    >
      {{ $t.sermons.all() }}
    </NuxtLink>
  </section>
</template>

<style>
.sermon-grid {
  display: grid;
  justify-items: start;
  gap: var(--space-7);
  margin: var(--space-7) 0;
}

.sermon-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-7) var(--space-6);
  width: 100%;
}
</style>
