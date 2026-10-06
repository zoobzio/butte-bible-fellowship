<script lang="ts">
import { Body } from "#components";
import { computed, useHead, useLocale, useNuxtApp } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { useMediaQuery } from "~/composables/viewport";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppInvitation from "~/components/AppInvitation.vue";
import Orbs from "~/components/Orbs.vue";
import Arches from "~/components/Arches.vue";
</script>

<script setup lang="ts">
const { path, locale: reading } = useRouteLocale();
const { $t } = useNuxtApp();
const { locale } = useLocale();

// The defaults a page overrides with its own title. The language is set
// here as well as by the fibber module, since Foundation's root sets "en".
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: $t.site.name(),
  meta: [{ name: "description", content: $t.site.description() }],
}));

const isMobile = useMediaQuery("(max-width: 44rem)");
const isHome = computed(() => path.value === "/");
const decor = computed(() => !isMobile.value);
</script>

<template>
  <Body>
    <Orbs v-if="decor" />
    <AppHeader />
    <main class="site-main">
      <slot />
    </main>
    <!-- The bar reads the events in the locale it is set up in: a visitor
         who changes language is handed a new one. -->
    <AppInvitation :key="reading" />
    <AppFooter />
    <Arches v-if="isHome && decor" />
  </Body>
</template>

<style>
.site-main {
  display: block;
  min-height: 60vh;
  padding-bottom: var(--space-9);
}
</style>
