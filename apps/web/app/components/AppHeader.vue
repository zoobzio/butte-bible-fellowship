<script lang="ts">
import { NuxtLink } from "#components";
import { useAppConfig, useT } from "#imports";

import AppMobileNav from "~/components/AppMobileNav.vue";
import { useRouteLocale } from "~/composables/locale";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

const { header } = useAppConfig();
const t = useT();
const { localize } = useRouteLocale();
</script>

<template>
  <header class="site-header">
    <NuxtLink :to="localize('/')" class="site-brand">
      <span class="site-brand-name">{{ t.site.name() }}</span>
      <span class="site-brand-tag">{{ t.site.tagline() }}</span>
    </NuxtLink>

    <nav class="site-nav" :aria-label="t.navigation.label()">
      <NuxtLink
        v-for="link in header.links"
        :key="link.to"
        :to="localize(link.to)"
        class="site-nav-link"
      >
        {{ t(link.label) }}
      </NuxtLink>
    </nav>

    <AppMobileNav />
  </header>
</template>
