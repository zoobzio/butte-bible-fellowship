<script lang="ts">
import { Body } from "#components";
import { useHead, useLocale } from "#imports";

import AdminSidebar from "~/components/AdminSidebar.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "Default" });

const { locale } = useLocale();
useHead(() => ({ htmlAttrs: { lang: locale.value } }));
</script>

<template>
  <Body>
    <div class="admin-shell">
      <AdminSidebar />
      <main :key="locale" class="admin-main">
        <slot />
      </main>
    </div>
  </Body>
</template>

<style>
.admin-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 100vh;
}

.admin-main {
  padding: var(--space-7) var(--space-7) var(--space-9);
}

@media (max-width: 44rem) {
  .admin-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .admin-main {
    padding: var(--space-5) var(--space-4) var(--space-8);
  }
}
</style>
