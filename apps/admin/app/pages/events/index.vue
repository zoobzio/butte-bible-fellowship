<script lang="ts">
import { useHead } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useEventsTable } from "~/composables/events";
</script>

<script setup lang="ts">
useHead({ title: "Events" });

const { widget, link } = useEventsTable();
</script>

<template>
  <PageHeader title="Events" to="/events/new" action="New event" />
  <RecordTable :widget="widget" :link="link" title="title" />
</template>
