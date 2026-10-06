<script lang="ts">
import { NuxtLink } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { slugOf } from "~/utils/events";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();
const { path, localize } = useRouteLocale();

// An event has no page of its own to read: it is one of the events page's,
// found by the slug its address ends with.
const { data: page } = await usePage("/events");

const slug = path.value.split("/").pop();
const event = computed(() =>
  page.value?.events?.find((event) => slugOf(event) === slug),
);

if (!event.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: event.value?.title }));
</script>

<template>
  <!-- A stub: the event's name and note, until the page is designed. -->
  <div v-if="event" class="event">
    <PageHeader :title="event.title" :description="event.note" />
    <NuxtLink :to="localize('/events')" class="cta">
      {{ $t.events.all() }}
    </NuxtLink>
  </div>
</template>

<style>
.event {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
  padding-bottom: clamp(var(--space-7), 7vw, var(--space-9));
}

.event .cta {
  margin-top: var(--space-7);
}
</style>
