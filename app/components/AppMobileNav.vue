<script lang="ts">
import type { MenuGroup, MenuItem } from "@zoobzio/foundation/types/core/menu";

import Menu from "@zoobzio/foundation/components/core/menu.vue";
import Button from "@zoobzio/foundation/components/common/button.vue";
import Icon from "@zoobzio/foundation/components/common/icon.vue";

import { navigateTo } from "#imports";

import { NAVIGATION } from "~/constants/navigation";
</script>

<script setup lang="ts">
/**
 * The primary navigation as a dropdown behind an icon-only menu button —
 * shown in place of the inline tabs on small screens (CSS swaps the two).
 * Built on core/menu, so focus, Escape, and outside-click handling come
 * from the dropdown-menu family.
 */
const groups: MenuGroup[] = [
  {
    key: "primary",
    items: NAVIGATION.map((link) => ({ label: link.label })),
  },
];

// Menu items carry labels, not routes; selection maps back to the link.
const onSelect = (item: MenuItem) => {
  const link = NAVIGATION.find((candidate) => candidate.label === item.label);
  if (link) navigateTo(link.to);
};
</script>

<template>
  <div class="site-nav-mobile">
    <!-- The trigger part composes asChild, so the slot must provide a real
         button — a bare icon would become the trigger element itself. -->
    <Menu :groups="groups" align="end" @select="onSelect">
      <Button :aria="{ label: 'Open navigation' }">
        <Icon alias="menu" />
      </Button>
    </Menu>
  </div>
</template>
