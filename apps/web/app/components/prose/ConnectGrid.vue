<script setup lang="ts">
defineOptions({ name: "ConnectGrid" });
</script>

<template>
  <section class="connect-grid">
    <slot />
  </section>
</template>

<style>
.connect-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-6);
  margin: var(--space-7) 0;
}
</style>
