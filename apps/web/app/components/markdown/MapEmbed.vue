<script setup lang="ts">
const { src, title } = defineProps<{
  src: string;
  title?: string;
}>();
</script>

<template>
  <iframe class="connect-map" :src="src" :title="title" loading="lazy" />
</template>
