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
.admin-main {
  width: min(100%, calc(var(--page-width) + 2 * var(--space-7)));
  margin-inline: auto;
  padding: var(--space-7) var(--space-7) var(--space-9);
}

@media (max-width: 44rem) {
  .admin-main {
    padding: var(--space-5) var(--space-4) var(--space-8);
  }
}
</style>
