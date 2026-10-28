<script lang="ts">
import {
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
  useRoute,
} from "#imports";

import EventArticle from "~/components/EventArticle.vue";
import { useEvent } from "~/composables/events";
import { usePage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();
const route = useRoute();

// The event is the one the address names.
const event = await useEvent();

if (!event.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

// What is written about it is a page of its own, at the event's address.
// An event nothing is written about yet has only what the calendar says.
const { data: page } = await usePage(route.path);

useHead(() => ({ title: page.value?.title ?? event.value?.title }));
</script>

<template>
  <EventArticle v-if="event" :event="event" :page="page" />
</template>
