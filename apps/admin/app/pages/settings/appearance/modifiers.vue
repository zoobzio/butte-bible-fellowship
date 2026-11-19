<script lang="ts">
import { definePageMeta } from "#imports";

import AppearanceEditor from "~/components/AppearanceEditor.vue";
import { useAppearanceSection } from "~/composables/settings/appearance";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

/*
 * What a visitor starts with for each of the theme's modifiers.
 * The form is the page above's to hold, which saves it with the rest.
 */
const editor = useAppearanceSection("modifiers");
</script>

<template>
  <AppearanceEditor :editor="editor" />
</template>
