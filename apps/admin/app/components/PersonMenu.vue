<script lang="ts">
import type { PersonRecord } from "@bbf/schema/types";

import { Menu } from "#components";
import { defineMenu, useNuxtApp } from "#imports";
import { usePersonRemoval } from "~/composables/people/removal";
</script>

<script setup lang="ts">
defineOptions({ name: "PersonMenu" });

const { record } = defineProps<{ record: PersonRecord }>();

const { $t } = useNuxtApp();

const { removing, error, destroy } = usePersonRemoval(record);

/* What can be done to the person, from their page's header. */
const menu = defineMenu(() => ({
  label: $t.admin.editor.actions(),
  groups: [
    {
      key: "person",
      items: [
        {
          key: "delete",
          label: removing.value
            ? $t.admin.editor.deleting()
            : $t.admin.editor.delete(),
          icon: "remove" as const,
          disabled: removing.value,
        },
      ],
    },
  ],
  align: "end" as const,
  onSelect: (item: { key: string }) => {
    if (item.key === "delete") destroy();
  },
}));
</script>

<template>
  <div class="person-menu">
    <Menu v-bind="menu" />
    <p v-if="error" class="person-menu-error" role="alert">{{ error }}</p>
  </div>
</template>

<style>
.person-menu {
  display: grid;
  justify-items: end;
  gap: var(--space-2);
}

.person-menu .f-dropdown-menu-trigger {
  padding: var(--space-2) var(--space-4);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.person-menu .f-dropdown-menu-trigger:hover,
.person-menu .f-dropdown-menu-trigger[data-state="open"] {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

.person-menu-error {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: var(--label-size);
}
</style>
