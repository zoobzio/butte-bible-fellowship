<script lang="ts">
import { Body } from "#components";
import { useHead, useLocale } from "#imports";

import AppHeader from "#layers/bbf/app/components/AppHeader.vue";
import AccountMenu from "~/components/AccountMenu.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "Default" });

const { locale } = useLocale();
useHead(() => ({ htmlAttrs: { lang: locale.value } }));
</script>

<template>
  <Body>
    <AppHeader>
      <AccountMenu />
    </AppHeader>
    <main :key="locale" class="admin-main">
      <slot />
    </main>
  </Body>
</template>

<style>
/*
 * The page keeps to its gutters and no more: its header leaves its own
 * room above and below, and a record's page ends at the bar that saves it.
 */
.admin-main {
  width: min(100%, calc(var(--page-width) + 2 * var(--space-7)));
  margin-inline: auto;
  padding-inline: var(--space-7);
}

@media (max-width: 44rem) {
  .admin-main {
    padding-inline: var(--space-4);
  }
}
</style>
