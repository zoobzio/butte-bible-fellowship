<script lang="ts">
import { NuxtPage } from "#components";
import { computed, definePageMeta, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { TABS } from "~/constants/settings";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

const { $t } = useNuxtApp();

useHead(() => ({ title: $t.admin.settings.title() }));

/*
 * What is set here, each a tab with an address of its own: how the site
 * looks, and nothing else yet. The site's own pages are not settings: they
 * are edited under Site.
 */
const tabs = computed(() => [
  { label: $t.admin.settings.appearance(), to: TABS.appearance },
]);
</script>

<template>
  <PageHeader
    :title="$t.admin.settings.title()"
    :description="$t.admin.settings.description()"
    :tabs="tabs"
  />
  <NuxtPage />
</template>
