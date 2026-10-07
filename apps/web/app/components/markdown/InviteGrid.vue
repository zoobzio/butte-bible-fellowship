<script setup lang="ts">
defineOptions({ name: "InviteGrid" });
</script>

<template>
  <section class="invite-grid">
    <slot />
  </section>
</template>

<style>
/* The invitations, a card each, in a row under the welcome: three across
   where there is room, and one under another where there is not. They
   close the article, so the article's own padding sets the week off. */
.invite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: var(--space-5);
  margin: var(--space-7) 0 0;
}
</style>
