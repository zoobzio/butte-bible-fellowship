<script lang="ts">
import { NuxtPage } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import ContentMenu from "~/components/ContentMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useContentRecord } from "~/composables/content/record";
import { BACK } from "~/composables/content/routes";
import { link } from "~/constants/content";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["content:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await useContentRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.content.notFound() });
}

useHead(() => ({ title: record.value?.title }));

/* The way back to the content, and the page's own pages, each a tab. */
const back = computed(() => ({
  label: $t.admin.content.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));
const tabs = computed(() =>
  record.value
    ? [{ label: $t.admin.content.page(), to: link(record.value) }]
    : [],
);
</script>

<template>
  <template v-if="record">
    <PageHeader
      :title="record.title"
      :description="record.description"
      :back="back"
      :tabs="tabs"
    >
      <ContentMenu :record="record" />
    </PageHeader>
    <NuxtPage :record="record" @saved="record = $event" />
  </template>
</template>
