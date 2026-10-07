<script setup lang="ts">
const { src, title } = defineProps<{
  src: string;
  title?: string;
}>();
</script>

<template>
  <iframe class="connect-map" :src="src" :title="title" loading="lazy" />
</template>

<style>
.connect-map {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 18rem;
  border: 1px var(--stroke-solid)
    color-mix(in oklab, var(--primary) 40%, var(--rule));
  border-radius: var(--shape-lg);
  background: var(--surface-container);
  box-shadow: var(--elevation-low);
}
</style>
