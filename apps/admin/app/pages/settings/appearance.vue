<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* How the site looks: nothing is set here yet. */
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });
</script>

<template>
  <div class="settings-appearance" />
</template>
