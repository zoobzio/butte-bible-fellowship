<script lang="ts">
import { definePageMeta, useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useTableRequest } from "~/composables/listing";
import { useStaffTable } from "~/composables/staff";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["staff:read"] } });

useHead({ title: "Staff" });

// The table's first page is fetched on load, once.
const { table, link } = useStaffTable();
await useTableRequest(table);
</script>

<template>
  <PageHeader title="Staff" to="/staff/new" action="New member" />
  <RecordTable :table="table" :link="link" title="name" />
</template>
