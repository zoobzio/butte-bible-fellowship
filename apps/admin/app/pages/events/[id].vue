<script lang="ts">
import { NuxtPage } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import EventMenu from "~/components/EventMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useEventRecord } from "~/composables/events/record";
import { BACK } from "~/composables/events/routes";
import { link } from "~/constants/events";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await useEventRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.events.notFound() });
}

useHead(() => ({ title: record.value?.title }));

/* The way back to the events, and the event's pages, each a tab. */
const back = computed(() => ({
  label: $t.admin.events.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));
const tabs = computed(() =>
  record.value
    ? [{ label: $t.admin.events.details(), to: link(record.value) }]
    : [],
);
</script>

<template>
  <template v-if="record">
    <PageHeader
      :title="record.title"
      :description="record.summary"
      :back="back"
      :tabs="tabs"
    >
      <EventMenu :record="record" />
    </PageHeader>
    <NuxtPage :record="record" @saved="record = $event" />
  </template>
</template>
