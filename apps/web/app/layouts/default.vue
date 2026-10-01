<script lang="ts">
import { computed, useHead, useRoute } from "#imports";

import { useColorMode } from "~/composables/color-mode";
import { useMediaQuery } from "~/composables/viewport";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppOrbs from "~/components/AppOrbs.vue";
import AppArchLines from "~/components/AppArchLines.vue";
</script>

<script setup lang="ts">
const route = useRoute();

// @bbf/theme keys its dark scheme off `data-color` on <html>.
const { mode } = useColorMode();
useHead({ htmlAttrs: { "data-color": mode } });

const isHome = computed(() => route.path === "/");

// The orbs and arch lines are scroll-driven decoration that doesn't pay for
// itself on phones. Gate them behind the mobile breakpoint (mirrors the
// `max-width: 44rem` in app.css) so on small screens they never mount — no
// scroll listeners, ResizeObserver, or rAF loops run at all.
const isMobile = useMediaQuery("(max-width: 44rem)");
const decor = computed(() => !isMobile.value);
</script>

<template>
  <Body>
    <AppOrbs v-if="decor" />
    <AppHeader />
    <main class="site-main">
      <slot />
    </main>
    <AppFooter />
    <!-- After the footer so the hero and footer are mounted before the
         arch geometry measures them. -->
    <AppArchLines v-if="isHome && decor" />
  </Body>
</template>
