<script setup lang="ts">
defineOptions({ name: "PageHeader" });

const { title, description } = defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <hr />
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.default" class="page-header-slot">
      <slot />
    </div>
  </header>
</template>

<style>
/* The header fills whatever holds it: the page sets the measure. */
.page-header {
  padding-top: clamp(var(--space-7), 7vw, var(--space-9));
}

.page-header > h1 {
  margin: 0;
}

.page-header > hr {
  width: var(--space-8);
  height: 2px;
  margin: var(--space-5) 0 0;
  border: 0;
  background: linear-gradient(
    108deg,
    var(--primary-500),
    var(--secondary-400) 52%,
    var(--tertiary-400)
  );
}

.page-header > p {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--title-size) * 1.35));
  line-height: 1.6;
  color: var(--on-surface-medium-contrast);
  max-width: 44ch;
  margin: var(--space-5) 0 0;
}

.page-header-slot {
  margin-top: var(--space-7);
}
</style>
