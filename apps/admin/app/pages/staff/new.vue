<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffEditor from "~/components/StaffEditor.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:write"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.staff.new() }));
</script>

<template>
  <PageHeader :title="$t.admin.staff.new()" />
  <StaffEditor :record="null" />
</template>
