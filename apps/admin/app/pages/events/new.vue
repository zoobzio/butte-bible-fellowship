<script lang="ts">
import { useHead } from "#imports";

import EventEditor from "~/components/EventEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
</script>

<script setup lang="ts">
useHead({ title: "New event" });
</script>

<template>
  <PageHeader title="New event" />
  <EventEditor :record="null" />
</template>
