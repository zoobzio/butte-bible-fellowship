<script lang="ts">
import { Icon } from "#components";
import { useColorMode } from "~/composables/theme";
</script>

<script setup lang="ts">
const { mode, other, toggle } = useColorMode();
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="`Switch to ${other} mode`"
    @click="toggle"
  >
    <Icon :name="mode === 'dark' ? 'sun' : 'moon'" class="icon" />
  </button>
</template>
