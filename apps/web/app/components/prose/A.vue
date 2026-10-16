<script lang="ts">
import { NuxtLink } from "#components";

import { useRouteLocale } from "~/composables/locale";
</script>

<script setup lang="ts">
// Renders every link of the pages: a link into the site keeps the reader in
// the locale they are reading, and one off it passes through as written.
// An element's override receives the element's attributes by their HTML
// names.
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
