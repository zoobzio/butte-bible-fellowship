<script lang="ts">
import { NuxtLink } from "#components";
</script>

<script setup lang="ts">
// Renders every link of the pages through NuxtLink, so one into the site
// navigates in place like every other link on it. An element's override
// receives the element's attributes by their HTML names.
const { href, target } = defineProps<{
  href?: string;
  target?: "_blank" | "_self";
}>();
</script>

<template>
  <NuxtLink :to="href" :target="target">
    <slot />
  </NuxtLink>
</template>
