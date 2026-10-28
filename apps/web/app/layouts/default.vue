<script lang="ts">
import { Body } from "#components";
import { useHead, useLocale, useNuxtApp } from "#imports";

import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppInvitation from "~/components/AppInvitation.vue";
</script>

<script setup lang="ts">
const { $t } = useNuxtApp();
const { locale } = useLocale();

useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: $t.site.name(),
  meta: [{ name: "description", content: $t.site.description() }],
}));
</script>

<template>
  <Body>
    <AppHeader />
    <main class="site-main">
      <slot />
    </main>
    <AppInvitation :key="locale" />
    <AppFooter />
  </Body>
</template>

<style>
.site-main {
  display: block;
  min-height: 60vh;
  padding-bottom: var(--space-9);
}
</style>
