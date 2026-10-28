<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:write"] } });

const { $t } = useNuxtApp();
useHead(() => ({ title: $t.admin.events.new() }));
</script>

<template>
  <PageHeader :title="$t.admin.events.new()" />
  <EventEditor :record="null" />
</template>
