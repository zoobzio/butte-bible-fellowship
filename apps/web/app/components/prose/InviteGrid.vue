<script setup lang="ts">
defineOptions({ name: "InviteGrid" });
</script>

<template>
  <section class="invite-grid">
    <slot />
  </section>
</template>

<style>
.invite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: var(--space-5);
  margin: var(--space-7) 0 0;
}
</style>
