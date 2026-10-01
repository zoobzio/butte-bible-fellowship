<script lang="ts">
import { computed } from "#imports";

import { useColorMode } from "~/composables/color-mode";
</script>

<script setup lang="ts">
/**
 * Icon-only light/dark toggle. The choice lives in useColorMode, so the
 * page restyles live and the cookie carries it to the next SSR.
 */
const { mode, set } = useColorMode();

const other = computed(() => (mode.value === "dark" ? "light" : "dark"));

const toggle = () => {
  set(other.value);
};
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
