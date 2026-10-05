<script lang="ts">
import { Body } from "#components";
import { computed, useHead, useLocale, useT } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { useMediaQuery } from "~/composables/viewport";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import Orbs from "~/components/Orbs.vue";
import Arches from "~/components/Arches.vue";
</script>

<script setup lang="ts">
const { path } = useRouteLocale();
const t = useT();
const { locale } = useLocale();

// The defaults a page overrides with its own title. The language is set
// here as well as by the fibber module, since Foundation's root sets "en".
useHead(() => ({
  htmlAttrs: { lang: locale.value },
  title: t.site.name(),
  meta: [{ name: "description", content: t.site.description() }],
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
    <AppFooter />
    <Arches v-if="isHome && decor" />
  </Body>
</template>
