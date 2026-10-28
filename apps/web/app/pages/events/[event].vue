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

const event = await useEvent();

if (!event.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

const { data: page } = await usePage(route.path);

useHead(() => ({ title: page.value?.title ?? event.value?.title }));
</script>

<template>
  <EventArticle v-if="event" :event="event" :page="page" />
</template>
