<script lang="ts">
import Main from "@zoobzio/foundation/components/common/main.vue";

import { computed, useRoute } from "#imports";

import AppHeader from "~/components/AppHeader.vue";
import AppFooter from "~/components/AppFooter.vue";
import AppOrbs from "~/components/AppOrbs.vue";
import AppArchLines from "~/components/AppArchLines.vue";
</script>

<script setup lang="ts">
const route = useRoute();
const isHome = computed(() => route.path === "/");
</script>

<template>
  <Body>
    <AppOrbs />
    <AppHeader />
    <Main class="site-main">
      <slot />
    </Main>
    <AppFooter />
    <!-- After the footer so the hero and footer are mounted before the
         arch geometry measures them. -->
    <AppArchLines v-if="isHome" />
  </Body>
</template>
