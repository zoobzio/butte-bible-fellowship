<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import RecordTable from "~/components/RecordTable.vue";
import { useEventsTable } from "~/composables/events";
import { useTableRequest } from "~/composables/listing";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.events.title() }));

const { table, link } = useEventsTable();
await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.events.title()"
    to="/events/new"
    :action="$t.admin.events.new()"
  />
  <RecordTable :table="table" :link="link" title="title" />
</template>
