<script lang="ts">
import { Table } from "#components";
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { useTableRequest } from "~/composables/listing";
import { useStaffTable } from "~/composables/staff/table";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

const { $t } = useNuxtApp();
const table = useStaffTable();

useHead(() => ({ title: $t.admin.staff.title() }));

await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.staff.title()"
    :description="$t.admin.staff.description()"
    to="/staff/new"
    :action="$t.admin.staff.new()"
  />
  <Table :service="table" />
</template>
