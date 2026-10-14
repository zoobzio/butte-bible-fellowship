<script lang="ts">
import type { Component } from "vue";

import type { PageItem } from "~/types/page";

import { ContentRenderer } from "#components";

import ConnectCard from "~/components/markdown/ConnectCard.vue";
import ConnectGrid from "~/components/markdown/ConnectGrid.vue";
import InviteCard from "~/components/markdown/InviteCard.vue";
import InviteGrid from "~/components/markdown/InviteGrid.vue";
import MapEmbed from "~/components/markdown/MapEmbed.vue";
import MarkdownAnchor from "~/components/markdown/MarkdownAnchor.vue";

/**
 * Tag → component map for the renderer, used with `prose: false`. Plain
 * markdown tags render as native HTML elements; links route through
 * NuxtLink, and MDC block components carry the app-level classes.
 */
const COMPONENTS: Record<string, Component> = {
  a: MarkdownAnchor,

  "connect-card": ConnectCard,
  "connect-grid": ConnectGrid,
  "invite-card": InviteCard,
  "invite-grid": InviteGrid,
  "map-embed": MapEmbed,
};
</script>

<script setup lang="ts">
defineOptions({ name: "MarkdownBody" });

// A page's body, rendered with the app's markdown components.
const { page } = defineProps<{ page: PageItem }>();
</script>

<template>
  <ContentRenderer :value="page" :components="COMPONENTS" :prose="false" />
</template>
