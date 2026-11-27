<script lang="ts">
import { NuxtPage } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { useSermonRecord } from "~/composables/sermons/record";
import { BACK } from "~/composables/sermons/routes";
import { link } from "~/constants/sermons";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["sermons:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await useSermonRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.sermons.notFound() });
}

useHead(() => ({ title: record.value?.title }));

/* The way back to the sermons, and the sermon's pages, each a tab. */
const back = computed(() => ({
  label: $t.admin.sermons.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));
const tabs = computed(() =>
  record.value
    ? [{ label: $t.admin.sermons.details(), to: link(record.value) }]
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
    />
    <NuxtPage :record="record" />
  </template>
</template>
