<script lang="ts">
import type { MenuGroup, MenuItem } from "~/components/Menu.vue";

import Menu from "~/components/Menu.vue";
import { navigateTo } from "#imports";
import { NAVIGATION } from "~/constants/navigation";
</script>

<script setup lang="ts">
const groups: MenuGroup[] = [
  {
    key: "primary",
    items: NAVIGATION.map((link) => ({ label: link.label })),
  },
];

const onSelect = (item: MenuItem) => {
  const link = NAVIGATION.find((candidate) => candidate.label === item.label);
  if (link) navigateTo(link.to);
};
</script>

<template>
  <div class="site-nav-mobile">
    <Menu :groups="groups" align="end" @select="onSelect">
      <button type="button" aria-label="Open navigation">
        <Icon name="menu" class="icon" />
      </button>
    </Menu>
  </div>
</template>
