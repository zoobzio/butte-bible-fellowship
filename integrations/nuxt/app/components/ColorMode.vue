<script lang="ts">
import { Icon } from "#components";
import { useNuxtApp } from "#imports";
import { useColorMode } from "#layers/bbf/app/composables/theme";
</script>

<script setup lang="ts">
defineOptions({ name: "ColorMode" });

const { $t } = useNuxtApp();
const { mode, other, toggle } = useColorMode();
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="$t.appearance.scheme({ mode: other })"
    @click="toggle"
  >
    <Icon :name="mode === 'dark' ? 'sun' : 'moon'" class="icon" />
  </button>
</template>
