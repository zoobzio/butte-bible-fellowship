<script lang="ts">
import type { PageLink } from "~/types/navigation";

import { Icon, NuxtLink, Tabs } from "#components";
import { usePageTabs } from "~/composables/navigation";
</script>

<script setup lang="ts">
defineOptions({ name: "PageHeader" });

const { title, description, back, to, action, tabs } = defineProps<{
  title: string;
  description?: string;
  back?: PageLink;
  to?: string;
  action?: string;
  tabs?: PageLink[];
}>();

const emit = defineEmits<{ action: [] }>();

defineSlots<{ default?: () => unknown }>();

const pages = usePageTabs(() => tabs);
</script>

<template>
  <header class="page-header">
    <div class="page-header-row">
      <div class="page-header-heading">
        <NuxtLink v-if="back" :to="back.to" class="page-header-back">
          <Icon
            v-if="back.icon"
            :name="back.icon"
            class="page-header-back-icon"
            aria-hidden="true"
          />
          {{ back.label }}
        </NuxtLink>
        <h1 class="page-header-title">{{ title }}</h1>
        <p v-if="description" class="page-header-description">
          {{ description }}
        </p>
      </div>
      <div v-if="action || $slots.default" class="page-header-actions">
        <NuxtLink v-if="action && to" :to="to" class="page-header-action">
          {{ action }}
        </NuxtLink>
        <button
          v-else-if="action"
          type="button"
          class="page-header-action"
          @click="emit('action')"
        >
          {{ action }}
        </button>
        <slot />
      </div>
    </div>
    <div v-if="tabs?.length" class="page-header-tabs">
      <Tabs v-bind="pages" />
    </div>
  </header>
</template>

<style>
/* The header leaves its own room above and below: the page around it has none. */
.page-header {
  display: grid;
  gap: var(--space-5);
  padding-block: var(--space-7) var(--space-6);
}

@media (max-width: 44rem) {
  .page-header {
    padding-block: var(--space-5) var(--space-6);
  }
}

/* The title's block on the left; what can be done sits level with it. */
.page-header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-5);
}

.page-header-heading {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

/* The way back to the page above, over the title, as a small-caps label. */
.page-header-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  justify-self: start;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.page-header-back:hover {
  color: var(--primary);
}

.page-header-back-icon {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}

.page-header-title {
  margin: 0;
  font: var(--type-headline);
  font-family: var(--font-display);
  letter-spacing: var(--type-headline-letter-spacing);
  color: var(--on-surface-high-contrast);
}

.page-header-description {
  margin: 0;
  max-width: 60ch;
  font: var(--type-body);
  color: var(--on-surface-muted);
}

/*
 * What can be done from the page: the way to a new record, a link to its
 * page or a button that opens it in place, or the record's menu.
 */
.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.page-header-action {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border: 0;
  border-radius: var(--shape-full);
  background: var(--primary);
  color: var(--on-primary);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  text-decoration: none;
  box-shadow: var(--elevation-low);
  cursor: pointer;
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.page-header-action:hover {
  color: var(--on-primary);
  transform: translateY(var(--lift));
  box-shadow: var(--elevation-mid);
}

/* The record's pages, as tabs along a rule: each a link, the read one lit. */
.page-header-tabs .f-tabs-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  border-bottom: 1px var(--stroke-solid) var(--rule);
}

.page-header-tabs .f-tabs-trigger {
  display: block;
  margin-bottom: -1px;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--on-surface-muted);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  text-decoration: none;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.page-header-tabs .f-tabs-trigger:hover {
  color: var(--on-surface-high-contrast);
}

.page-header-tabs .f-tabs-trigger[data-state="active"] {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.page-header-tabs .f-tabs-content {
  display: none;
}
</style>
