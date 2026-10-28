<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useTableRequest } from "~/composables/listing";
import { useStaffTable } from "~/composables/staff";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.staff.title() }));

const { table, link } = useStaffTable();
await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.staff.title()"
    to="/staff/new"
    :action="$t.admin.staff.new()"
  />
  <RecordTable :table="table" :link="link" title="name" />
</template>
