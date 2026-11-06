<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
import { BACK } from "~/composables/staff/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:write"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.staff.new() }));

const back = {
  label: $t.admin.staff.title(),
  to: BACK,
  icon: "chevron-left" as const,
};
</script>

<template>
  <PageHeader :title="$t.admin.staff.new()" :back="back" />
  <StaffEditor :record="null" />
</template>
