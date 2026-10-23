<script lang="ts">
import type {
  MenuItem,
  MenuPassthrough,
} from "@zoobzio/vue/types/components/menu";

import { DropdownMenuItem } from "reka-ui";

import { NuxtLink } from "#components";
</script>

<script setup lang="ts" generic="T extends MenuItem">
// The design system renders a menu's link items as plain anchors, which
// the router does not see. This item takes the menu's own settings for the
// part and renders the link through NuxtLink, so choosing it navigates in
// place like every other link on the site.
const { item, settings } = defineProps<{
  item: T;
  settings: MenuPassthrough<T>;
}>();
</script>

<template>
  <DropdownMenuItem class="f-dropdown-menu-item" v-bind="settings.item(item)">
    <NuxtLink
      v-if="item.link"
      :to="item.disabled ? undefined : item.link.to"
      :target="item.link.target"
    >
      <span class="f-span">{{ item.label }}</span>
    </NuxtLink>
    <span v-else class="f-span">{{ item.label }}</span>
  </DropdownMenuItem>
</template>
