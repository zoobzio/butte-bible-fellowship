<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import EventsBrowser from "~/components/EventsBrowser.vue";
import { usePage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage("/events");

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));
</script>

<template>
  <EventsBrowser v-if="page" :events="page.events" />
</template>
