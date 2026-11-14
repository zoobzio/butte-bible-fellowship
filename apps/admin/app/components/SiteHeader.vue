<script lang="ts">
import type { SitePageLink } from "~/types/navigation";

import { computed, useHead, useNuxtApp } from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import { BACK } from "~/composables/site/routes";
import { tabs as tabsOf } from "~/constants/site";
</script>

<script setup lang="ts">
defineOptions({ name: "SiteHeader" });

/*
 * The header of one of the site's own pages in the admin, whichever it
 * is: the page's name and what of it is changed here, over the way back
 * to the list it was opened from, and its tabs, each a page under it.
 */
const { page } = defineProps<{ page: SitePageLink }>();

const { $t } = useNuxtApp();

useHead(() => ({ title: $t(page.label) }));

const back = computed(() => ({
  label: $t.admin.pages.title(),
  to: BACK,
  icon: "chevron-left" as const,
}));

/* Content is the first tab, and the only one yet. */
const tabs = computed(() => [
  { label: $t.admin.pages.content(), to: tabsOf(page).content },
]);
</script>

<template>
  <PageHeader
    :title="$t(page.label)"
    :description="$t(page.description)"
    :back="back"
    :tabs="tabs"
  />
</template>
