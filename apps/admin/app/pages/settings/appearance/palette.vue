<script lang="ts">
import { definePageMeta } from "#imports";

import AppearanceEditor from "~/components/AppearanceEditor.vue";
import { useAppearanceSection } from "~/composables/settings/appearance";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

/*
 * The colors of the site: one for each ramp of its theme's palette.
 * The form is the page above's to hold, which saves it with the rest.
 */
const editor = useAppearanceSection("palette");
</script>

<template>
  <AppearanceEditor :editor="editor" />
</template>
