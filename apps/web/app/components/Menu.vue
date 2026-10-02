<script lang="ts">
import { NuxtLink } from "#components";

import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "reka-ui";

export type MenuItem = {
  label: string;
  /** Renders the item as a link to this URL. */
  to?: string;
  disabled?: boolean;
};

export type MenuGroup = {
  key: string;
  label?: string;
  items: MenuItem[];
};

export type MenuProps = {
  label?: string;
  groups: MenuGroup[];
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
};

export const MENU_SIDE_OFFSET = 10;
</script>

<script setup lang="ts">
/**
 * Dropdown menu over reka-ui's DropdownMenu family — focus, Escape, and
 * outside-click handling come from reka. Adapted from foundation's
 * core/menu, minus its passthrough/context plumbing.
 */
const {
  label,
  groups,
  side = "bottom",
  align = "center",
  sideOffset = MENU_SIDE_OFFSET,
  alignOffset = 0,
} = defineProps<MenuProps>();

const emit = defineEmits<{
  select: [item: MenuItem];
}>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <DropdownMenuRoot v-model:open="open">
    <slot name="trigger">
      <DropdownMenuTrigger class="menu-trigger" as-child>
        <slot>
          <button type="button">{{ label }}</button>
        </slot>
      </DropdownMenuTrigger>
    </slot>
    <DropdownMenuPortal>
      <DropdownMenuContent
        class="menu-content"
        :side="side"
        :align="align"
        :side-offset="sideOffset"
        :align-offset="alignOffset"
      >
        <slot name="content">
          <template v-for="(group, groupIndex) in groups" :key="group.key">
            <DropdownMenuSeparator
              v-if="groupIndex > 0"
              class="menu-separator"
            />
            <DropdownMenuGroup class="menu-group">
              <DropdownMenuLabel
                v-if="group.label"
                class="menu-label"
                as-child
              >
                <slot name="groupLabel" :group="group">
                  <div>{{ group.label }}</div>
                </slot>
              </DropdownMenuLabel>
              <template v-for="item in group.items" :key="item.label">
                <slot name="item" :item="item">
                  <DropdownMenuItem
                    v-if="item.to"
                    class="menu-item"
                    :disabled="item.disabled"
                    as-child
                    @select="emit('select', item)"
                  >
                    <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-else
                    class="menu-item"
                    :disabled="item.disabled"
                    @select="emit('select', item)"
                  >
                    <span>{{ item.label }}</span>
                  </DropdownMenuItem>
                </slot>
              </template>
            </DropdownMenuGroup>
          </template>
        </slot>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
