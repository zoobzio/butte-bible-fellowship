import type { Component } from "vue";

import ConnectCard from "~/components/markdown/ConnectCard.vue";
import ConnectGrid from "~/components/markdown/ConnectGrid.vue";
import InviteCard from "~/components/markdown/InviteCard.vue";
import InviteGrid from "~/components/markdown/InviteGrid.vue";
import MapEmbed from "~/components/markdown/MapEmbed.vue";
import MarkdownAnchor from "~/components/markdown/MarkdownAnchor.vue";

/**
 * Tag → component map for ContentRenderer (used with `prose: false`).
 * Plain markdown tags render as native HTML elements; links route through
 * NuxtLink, and MDC block components carry the app-level classes.
 */
export const MARKDOWN_COMPONENTS: Record<string, Component> = {
  a: MarkdownAnchor,

  "connect-card": ConnectCard,
  "connect-grid": ConnectGrid,
  "invite-card": InviteCard,
  "invite-grid": InviteGrid,
  "map-embed": MapEmbed,
};
