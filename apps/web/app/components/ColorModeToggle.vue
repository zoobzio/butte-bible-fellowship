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
    <svg
      v-if="mode === 'dark'"
      class="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </g>
    </svg>
    <svg v-else class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      />
    </svg>
  </button>
</template>
