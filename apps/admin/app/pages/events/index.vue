<script lang="ts">
import { useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useEventsTable } from "~/composables/events";
import { useTableRequest } from "~/composables/listing";
</script>

<script setup lang="ts">
useHead({ title: "Events" });

// The table's first page is fetched on load, once.
const { table, link } = useEventsTable();
await useTableRequest(table);
</script>

<template>
  <PageHeader title="Events" to="/events/new" action="New event" />
  <RecordTable :table="table" :link="link" title="title" />
</template>
