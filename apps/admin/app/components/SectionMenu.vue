<script lang="ts">
import type { Section } from "~/types/settings";

import { NuxtLink } from "#components";
import { useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "SectionMenu" });

/*
 * The menu beside a page of settings: its sections, each a link to a page
 * of its own, the one being read marked. A section with changes not saved
 * says so in a small mark at its end, and so does one a save found
 * something wrong in, which is the more pressing of the two.
 */
const { label, sections } = defineProps<{
  label: string;
  sections: Section[];
}>();

const { $t } = useNuxtApp();
</script>

<template>
  <nav class="section-menu" :aria-label="label">
    <ul class="section-menu-list">
      <li v-for="section in sections" :key="section.to">
        <NuxtLink
          :to="section.to"
          class="section-menu-link"
          :aria-current="section.current ? 'page' : undefined"
        >
          <span class="section-menu-label">{{ section.label }}</span>
          <span
            v-if="section.invalid"
            class="section-menu-status"
            role="img"
            data-status="invalid"
            :title="$t.admin.editor.invalid()"
            :aria-label="$t.admin.editor.invalid()"
          />
          <span
            v-else-if="section.unsaved"
            class="section-menu-status"
            role="img"
            data-status="unsaved"
            :title="$t.admin.editor.unsaved()"
            :aria-label="$t.admin.editor.unsaved()"
          />
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style>
.section-menu-list {
  display: grid;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A section: its name, and at its end the mark of changes not saved. */
.section-menu-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-inline-start: 2px solid transparent;
  border-radius: var(--shape-sm);
  color: var(--on-surface-muted);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  text-decoration: none;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);
}

.section-menu-link:hover {
  color: var(--on-surface-high-contrast);
}

.section-menu-link:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}

/* The one being read is lit, with a rule at its start. */
.section-menu-link[aria-current="page"] {
  border-inline-start-color: var(--primary);
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  background: color-mix(in oklab, var(--primary) 8%, transparent);
  color: var(--primary);
}

.section-menu-label {
  flex: 1;
  min-width: 0;
}

/* Changes not saved: a dot in the color of a warning. Something wrong: of an error. */
.section-menu-status {
  flex: none;
  width: var(--space-2);
  height: var(--space-2);
  margin-inline-end: var(--space-1);
  border-radius: var(--shape-full);
  background: var(--warning);
}

.section-menu-status[data-status="invalid"] {
  background: var(--error);
}
</style>
