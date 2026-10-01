<script lang="ts">
import type { MenuGroup, MenuItem } from "~/components/Menu.vue";

import Menu from "~/components/Menu.vue";

import { navigateTo } from "#imports";

import { NAVIGATION } from "~/constants/navigation";
</script>

<script setup lang="ts">
/**
 * The primary navigation as a dropdown behind an icon-only menu button —
 * shown in place of the inline tabs on small screens (CSS swaps the two).
 * Built on the local Menu, so focus, Escape, and outside-click handling come
 * from reka-ui's dropdown-menu family.
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
      <button type="button" aria-label="Open navigation">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 5h16M4 12h16M4 19h16"
          />
        </svg>
      </button>
    </Menu>
  </div>
</template>
