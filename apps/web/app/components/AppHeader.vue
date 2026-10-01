<script lang="ts">
import { NAVIGATION } from "~/constants/navigation";
import AppMobileNav from "~/components/AppMobileNav.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });
</script>

<template>
  <header class="site-header">
    <NuxtLink to="/" class="site-brand">
      <span class="site-brand-name">Butte Bible Fellowship</span>
      <span class="site-brand-tag">The Church on Pillsbury Road</span>
    </NuxtLink>

    <nav class="site-nav" aria-label="Primary">
      <NuxtLink
        v-for="link in NAVIGATION"
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
