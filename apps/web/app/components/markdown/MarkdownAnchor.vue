<script setup lang="ts">
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
