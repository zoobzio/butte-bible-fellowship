<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useEventRecord } from "~/composables/events";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await useEventRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.events.notFound() });
}

useHead(() => ({ title: record.value?.title }));
</script>

<template>
  <template v-if="record">
    <PageHeader :title="record.title" />
    <EventEditor :record="record" />
  </template>
</template>
