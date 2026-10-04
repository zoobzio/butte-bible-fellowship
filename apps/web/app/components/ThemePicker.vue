<script lang="ts">
import type { MenuItem } from "@zoobzio/foundation/types/core/menu";
import type { Theme } from "~/types/theme";

import Menu from "@zoobzio/foundation/components/core/menu.vue";

import { Icon } from "#components";
import { useThemes } from "~/composables/themes";
</script>

<script setup lang="ts">
type ThemeItem = MenuItem & { id: Theme };

const { themes, active, choose } = useThemes();

const items: ThemeItem[] = themes.map(({ id, name }) => ({ id, label: name }));

const groups = [{ key: "themes", items }];

const onSelect = (item: ThemeItem) => {
  choose(item.id);
};
</script>

<template>
  <Menu :groups="groups" side="top" align="start" @select="onSelect">
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
