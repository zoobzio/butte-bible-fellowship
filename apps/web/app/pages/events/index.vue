<script lang="ts">
import { definePageMeta, useHead, useNuxtApp } from "#imports";

import EventsBrowser from "~/components/EventsBrowser.vue";
import { useEvents } from "~/composables/events";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

useHead(() => ({ title: $t.events.head() }));

const events = await useEvents();
</script>

<template>
  <EventsBrowser :events="events" />
</template>
