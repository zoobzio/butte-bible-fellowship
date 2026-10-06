<script lang="ts">
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import SermonCard from "~/components/SermonCard.vue";
import SermonGrid from "~/components/SermonGrid.vue";
import { usePage } from "~/composables/page";
import { useSermons } from "~/composables/sermons";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage("/sermons");

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));

const { data: sermons } = await useSermons();

// The newest sermon leads the page from its header; the grid lists the rest.
const latest = computed(() => sermons.value?.[0]);
const rest = computed(() => sermons.value?.slice(1) ?? []);
</script>

<template>
  <div v-if="page" class="sermons">
    <PageHeader
      :title="$t.sermons.title()"
      :description="$t.sermons.description()"
    >
      <template v-if="latest" #default>
        <SermonCard :sermon="latest" featured />
      </template>
    </PageHeader>
    <SermonGrid :sermons="rest" />
  </div>
</template>

<style>
.sermons {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.sermons .sermon-grid {
  margin-top: clamp(var(--space-7), 7vw, var(--space-9));
}
</style>
