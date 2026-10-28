<script lang="ts">
import { NuxtLink } from "#components";
</script>

<script setup lang="ts">
defineOptions({ name: "PageHeader" });

const { title, to, action } = defineProps<{
  title: string;
  to?: string;
  action?: string;
}>();
</script>

<template>
  <header class="page-header">
    <h1 class="page-header-title">{{ title }}</h1>
    <NuxtLink v-if="to && action" :to="to" class="page-header-action">
      {{ action }}
    </NuxtLink>
  </header>
</template>

<style>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3) var(--space-5);
  margin-bottom: var(--space-6);
}

.page-header-title {
  margin: 0;
  font: var(--type-headline);
  font-family: var(--font-display);
  letter-spacing: var(--type-headline-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.page-header-action {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--shape-full);
  background: var(--primary);
  color: var(--on-primary);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  text-decoration: none;
  box-shadow: var(--elevation-low);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.page-header-action:hover {
  color: var(--on-primary);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}
</style>
