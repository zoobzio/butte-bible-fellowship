<script lang="ts">
import { createError, definePageMeta, useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import { useStaffRecord } from "~/composables/staff";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

// The member is the one the address names, by id.
const { data: record } = await useStaffRecord();

if (!record.value) {
  throw createError({ statusCode: 404, message: "Staff member not found" });
}

useHead(() => ({ title: record.value?.name }));
</script>

<template>
  <template v-if="record">
    <PageHeader :title="record.name" />
    <StaffEditor :record="record" />
  </template>
</template>
