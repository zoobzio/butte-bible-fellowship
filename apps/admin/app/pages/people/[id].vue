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
import PersonMenu from "~/components/PersonMenu.vue";
import { usePersonRecord } from "~/composables/people/record";
import { BACK } from "~/composables/people/routes";
import { link } from "~/constants/people";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["people:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await usePersonRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.people.notFound() });
}

useHead(() => ({ title: record.value?.name }));

/* The way back to the people, and the person's pages, each a tab. */
const back = computed(() => ({
  label: $t.admin.people.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));
const tabs = computed(() =>
  record.value
    ? [{ label: $t.admin.people.profile(), to: link(record.value) }]
    : [],
);
</script>

<template>
  <template v-if="record">
    <PageHeader
      :title="record.name"
      :description="record.summary"
      :back="back"
      :tabs="tabs"
    >
      <PersonMenu :record="record" />
    </PageHeader>
    <NuxtPage :record="record" @saved="record = $event" />
  </template>
</template>
