<script lang="ts">
import { NuxtLink } from "#components";
import { useNuxtApp } from "#imports";

import SermonGrid from "~/components/SermonGrid.vue";
import { useRouteLocale } from "~/composables/locale";
import { useRecentSermons } from "~/composables/sermons";
</script>

<script setup lang="ts">
defineOptions({ name: "HomeSermons" });

const { $t } = useNuxtApp();
const { localize } = useRouteLocale();

// The three newest sermons close the page: the sermons page has the rest.
const recent = await useRecentSermons();
</script>

<template>
  <section v-if="recent.length" class="home-sermons">
    <h2>{{ $t.sermons.recent() }}</h2>
    <SermonGrid :sermons="recent">
      <NuxtLink :to="localize('/sermons')" class="cta">
        {{ $t.sermons.more() }}
      </NuxtLink>
    </SermonGrid>
  </section>
</template>

<style>
/* The week's own margin has already set the sermons off from it. */
.home-sermons {
  margin-top: clamp(var(--space-8), 8vw, var(--space-9));
}

.home-sermons h2 {
  margin-top: 0;
}

.home-sermons .sermon-grid {
  margin: var(--space-6) 0 0;
}
</style>
