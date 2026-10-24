<script lang="ts">
import { definePageMeta, useHead } from "#imports";

import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["events:write"] } });

useHead({ title: "New event" });
</script>

<template>
  <PageHeader title="New event" />
  <EventEditor :record="null" />
</template>
