<script lang="ts">
import type { MenuItem } from "@zoobzio/foundation/types/core/menu";

import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { computed } from "#imports";
import { useThemes } from "~/composables/themes";
</script>

<script setup lang="ts">
type ThemeItem = MenuItem & { id: string };

const { themes, active, load, choose } = useThemes();

/* The catalog is listed the first time the menu opens; until it answers,
   the menu holds one inert placeholder. */
const items = computed<ThemeItem[]>(() =>
  themes.value.length > 0
    ? themes.value.map(({ id, name }) => ({ id, label: name }))
    : [{ id: "", label: "Loading themes…", disabled: true }],
);

const groups = computed(() => [{ key: "themes", items: items.value }]);

const onOpen = (open: boolean) => {
  if (open) {
    void load();
  }
};

const onSelect = (item: ThemeItem) => {
  void choose(item.id);
};
</script>

<template>
  <Menu
    :groups="groups"
    side="top"
    align="start"
    @update:open="onOpen"
    @select="onSelect"
  >
    <button type="button" class="theme-toggle" aria-label="Choose a theme">
      <Icon name="palette" class="icon" />
    </button>
    <template #itemLabel="{ item }">
      <span
        class="f-span"
        :aria-current="item.id === active ? 'true' : undefined"
      >
        {{ item.label }}
      </span>
    </template>
  </Menu>
</template>
