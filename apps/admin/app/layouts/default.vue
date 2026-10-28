<script lang="ts">
import { Body } from "#components";
import { useHead, useLocale } from "#imports";

import AdminSidebar from "~/components/AdminSidebar.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "Default" });

// The language is set on the document here as well as by the prosary
// module, since the @zoobzio/nuxt layer's root sets "en" over it.
const { locale } = useLocale();
useHead(() => ({ htmlAttrs: { lang: locale.value } }));
</script>

<template>
  <Body>
    <div class="admin-shell">
      <AdminSidebar />
      <!-- A page names its table's columns and its delete prompt in the
           language it is set up in: one who changes language is handed the
           page set up again in the new one. -->
      <main :key="locale" class="admin-main">
        <slot />
      </main>
    </div>
  </Body>
</template>

<style>
/* The sidebar beside the page, the page taking the rest of the window. */
.admin-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 100vh;
}

.admin-main {
  padding: var(--space-7) var(--space-7) var(--space-9);
}

/* Small screens: the sidebar is a bar over the page. */
@media (max-width: 44rem) {
  .admin-shell {
    grid-template-columns: minmax(0, 1fr);
  }
  .admin-main {
    padding: var(--space-5) var(--space-4) var(--space-8);
  }
}
</style>
