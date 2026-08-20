<script lang="ts">
import Button from "@zoobzio/foundation/components/common/button.vue";
import Icon from "@zoobzio/foundation/components/common/icon.vue";

import { computed, useUntheme } from "#imports";
</script>

<script setup lang="ts">
/**
 * Icon-only light/dark toggle over untheme's color axis. Swapping goes
 * through the untheme service, so the page restyles live and the choice
 * persists in the untheme-input cookie the runtime already reads on SSR.
 */
const untheme = useUntheme();

const color = computed(() => untheme.config.input.color);
const other = computed(() => (color.value === "dark" ? "light" : "dark"));

const toggle = () => {
  untheme.swap("color", other.value);
};
</script>

<template>
  <Button
    class="theme-toggle"
    :aria="{ label: `Switch to ${other} mode` }"
    @click="toggle"
  >
    <Icon :alias="color === 'dark' ? 'sun' : 'moon'" />
  </Button>
</template>
