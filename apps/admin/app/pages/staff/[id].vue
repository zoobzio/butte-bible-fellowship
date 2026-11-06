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
import StaffMenu from "~/components/StaffMenu.vue";
import { useStaffRecord } from "~/composables/staff/record";
import { BACK } from "~/composables/staff/routes";
import { link } from "~/constants/staff";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

const { $t } = useNuxtApp();
const { data: record } = await useStaffRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: $t.admin.staff.notFound() });
}

useHead(() => ({ title: record.value?.name }));

/* The way back to the staff, and the member's pages, each a tab. */
const back = computed(() => ({
  label: $t.admin.staff.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));
const tabs = computed(() =>
  record.value
    ? [{ label: $t.admin.staff.profile(), to: link(record.value) }]
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
      <StaffMenu :record="record" />
    </PageHeader>
    <NuxtPage :record="record" @saved="record = $event" />
  </template>
</template>
