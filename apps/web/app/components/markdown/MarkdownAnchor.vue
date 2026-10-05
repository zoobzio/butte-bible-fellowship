<script lang="ts">
import { NuxtLink } from "#components";

import { useRouteLocale } from "~/composables/locale";
</script>

<script setup lang="ts">
const { href, target } = defineProps<{
  href?: string;
  target?: "_blank" | "_self";
}>();

const { localize } = useRouteLocale();
</script>

<template>
  <NuxtLink
    :to="href === undefined ? undefined : localize(href)"
    :target="target"
  >
    <slot />
  </NuxtLink>
</template>
