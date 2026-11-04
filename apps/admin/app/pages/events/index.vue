<script lang="ts">
import { Table } from "#components";
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { useEventsTable } from "~/composables/events";
import { useTableRequest } from "~/composables/listing";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:read"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.events.title() }));

const table = useEventsTable();
await useTableRequest(table);
</script>

<template>
  <PageHeader
    :title="$t.admin.events.title()"
    to="/events/new"
    :action="$t.admin.events.new()"
  />
  <Table :service="table" />
</template>
