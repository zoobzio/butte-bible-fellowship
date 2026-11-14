<script lang="ts">
import { NuxtPage } from "#components";
import { definePageMeta } from "#imports";

import SiteHeader from "~/components/SiteHeader.vue";
import { SITE_PAGES } from "~/constants/site";
</script>

<script setup lang="ts">
/* The site's home page in the admin: its header and tabs, over the tab being read. */
definePageMeta({ middleware: "auth", auth: { scopes: ["site:read"] } });
</script>

<template>
  <SiteHeader :page="SITE_PAGES.home" />
  <NuxtPage />
</template>
