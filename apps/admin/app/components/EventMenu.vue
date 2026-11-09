<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { Menu } from "#components";
import { defineMenu, useNuxtApp } from "#imports";
import { useEventRemoval } from "~/composables/events/removal";
</script>

<script setup lang="ts">
defineOptions({ name: "EventMenu" });

const { record } = defineProps<{ record: EventRecord }>();

const { $t } = useNuxtApp();

const { removing, error, destroy } = useEventRemoval(record);

/* What can be done to the event, from its page's header. */
const menu = defineMenu(() => ({
  label: $t.admin.editor.actions(),
  groups: [
    {
      key: "event",
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
  <div class="event-menu">
    <Menu v-bind="menu" />
    <p v-if="error" class="event-menu-error" role="alert">{{ error }}</p>
  </div>
</template>

<style>
.event-menu {
  display: grid;
  justify-items: end;
  gap: var(--space-2);
}

.event-menu .f-dropdown-menu-trigger {
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

.event-menu .f-dropdown-menu-trigger:hover,
.event-menu .f-dropdown-menu-trigger[data-state="open"] {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

.event-menu-error {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
  font-size: var(--label-size);
}
</style>
