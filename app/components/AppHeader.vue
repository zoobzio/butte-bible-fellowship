<script lang="ts">
import Header from "@zoobzio/foundation/components/common/header.vue";
import Nav from "@zoobzio/foundation/components/common/nav.vue";
import Anchor from "@zoobzio/foundation/components/common/anchor.vue";
import Span from "@zoobzio/foundation/components/common/span.vue";

import { NAVIGATION } from "~/constants/navigation";
import AppMobileNav from "~/components/AppMobileNav.vue";
</script>

<script setup lang="ts">
defineOptions({ name: "AppHeader" });
</script>

<template>
  <Header class="site-header">
    <Anchor to="/" class="site-brand">
      <Span class="site-brand-name">Butte Bible Fellowship</Span>
      <Span class="site-brand-tag">The Church on Pillsbury Road</Span>
    </Anchor>

    <Nav class="site-nav" aria-label="Primary">
      <Anchor
        v-for="link in NAVIGATION"
        :key="link.to"
        :to="link.to"
        :label="link.label"
        class="site-nav-link"
      />
    </Nav>

    <AppMobileNav />
  </Header>
</template>
