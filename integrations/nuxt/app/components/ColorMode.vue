<script lang="ts">
import type { ColorModeLabels } from "#layers/bbf/app/types/theme";

import { Icon } from "#components";
import { useColorMode } from "#layers/bbf/app/composables/theme";
</script>

<script setup lang="ts">
defineOptions({ name: "ColorMode" });

// The button's name says which scheme a press switches to. An app that
// speaks another language names it in that one.
const {
  labels = { light: "Switch to light mode", dark: "Switch to dark mode" },
} = defineProps<{ labels?: ColorModeLabels }>();

const { mode, other, toggle } = useColorMode();
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="labels[other]"
    @click="toggle"
  >
    <Icon :name="mode === 'dark' ? 'sun' : 'moon'" class="icon" />
  </button>
</template>
