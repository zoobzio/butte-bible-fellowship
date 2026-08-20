<script lang="ts">
import Main from "@zoobzio/foundation/components/common/main.vue";

import { computed, useRoute } from "#imports";

import { useMediaQuery } from "~/composables/viewport";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppOrbs from "~/components/AppOrbs.vue";
import AppArchLines from "~/components/AppArchLines.vue";
</script>

<script setup lang="ts">
const route = useRoute();
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
    <Main class="site-main">
      <slot />
    </Main>
    <AppFooter />
    <!-- After the footer so the hero and footer are mounted before the
         arch geometry measures them. -->
    <AppArchLines v-if="isHome && decor" />
  </Body>
</template>
