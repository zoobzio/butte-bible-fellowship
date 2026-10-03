<script lang="ts">
import { NuxtLink } from "#components";
import { useAppConfig } from "#imports";

import AppMobileNav from "~/components/AppMobileNav.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });

const { site, header } = useAppConfig();
</script>

<template>
  <header class="site-header">
    <NuxtLink to="/" class="site-brand">
      <span class="site-brand-name">{{ site.name }}</span>
      <span class="site-brand-tag">{{ site.tagline }}</span>
    </NuxtLink>

    <nav class="site-nav" aria-label="Primary">
      <NuxtLink
        v-for="link in header.links"
        :key="link.to"
        :to="link.to"
        class="site-nav-link"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>

    <AppMobileNav />
  </header>
</template>
