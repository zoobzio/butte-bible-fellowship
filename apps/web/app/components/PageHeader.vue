<script lang="ts">
import { Icon } from "#components";

import { usePageBack } from "~/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "PageHeader" });

const { title, description, back } = defineProps<{
  title: string;
  description?: string;
  back?: string;
}>();

const { up, leave } = usePageBack();
</script>

<template>
  <header class="page-header">
    <a
      v-if="back"
      :href="up"
      class="page-header-back"
      @click.exact.prevent="leave"
    >
      <Icon name="chevron-left" class="icon" aria-hidden="true" />
      {{ back }}
    </a>
    <h1 class="page-title">{{ title }}</h1>
    <hr />
    <p v-if="description">{{ description }}</p>
    <div v-if="$slots.default" class="page-header-slot">
      <slot />
    </div>
  </header>
</template>

<style>
.page-header {
  padding-top: clamp(var(--space-7), 7vw, var(--space-9));
}

.page-header-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  font-size: clamp(
    var(--label-size),
    calc(var(--label-size) * 0.9 + 0.4vw),
    var(--body-size)
  );
  letter-spacing: var(--type-label-letter-spacing);
  color: var(--on-surface-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.page-header-back:hover {
  color: var(--on-surface-high-contrast);
}

.page-header-back .icon {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}

.page-header > h1 {
  margin: 0;
}

.page-header > hr {
  width: var(--space-8);
  height: 2px;
  margin: var(--space-5) 0 0;
  border: 0;
  background: var(--gradient-signature);
}

.page-header > p {
  font: var(--type-title);
  font-family: var(--font-display);
  font-size: clamp(var(--title-size), 2.2vw, calc(var(--title-size) * 1.35));
  line-height: 1.6;
  color: var(--on-surface);
  max-width: 44ch;
  margin: var(--space-5) 0 0;
}

.page-header-slot {
  margin-top: var(--space-7);
}
</style>
