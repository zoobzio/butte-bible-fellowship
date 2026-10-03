<script lang="ts">
import { Body } from "#components";
import { computed, useRoute } from "#imports";

import { useMediaQuery } from "~/composables/viewport";
import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import Orbs from "~/components/Orbs.vue";
import Arches from "~/components/Arches.vue";
</script>

<script setup lang="ts">
const route = useRoute();
const isMobile = useMediaQuery("(max-width: 44rem)");
const isHome = computed(() => route.path === "/");
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
