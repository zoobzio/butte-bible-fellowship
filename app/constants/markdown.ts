import type { Component } from "vue";

import Blockquote from "@zoobzio/foundation/components/common/blockquote.vue";
import Code from "@zoobzio/foundation/components/common/code.vue";
import Em from "@zoobzio/foundation/components/common/em.vue";
import H1 from "@zoobzio/foundation/components/common/h1.vue";
import H2 from "@zoobzio/foundation/components/common/h2.vue";
import H3 from "@zoobzio/foundation/components/common/h3.vue";
import H4 from "@zoobzio/foundation/components/common/h4.vue";
import Hr from "@zoobzio/foundation/components/common/hr.vue";
import Img from "@zoobzio/foundation/components/common/img.vue";
import Li from "@zoobzio/foundation/components/common/li.vue";
import Ol from "@zoobzio/foundation/components/common/ol.vue";
import P from "@zoobzio/foundation/components/common/p.vue";
import Pre from "@zoobzio/foundation/components/common/pre.vue";
import Strong from "@zoobzio/foundation/components/common/strong.vue";
import Table from "@zoobzio/foundation/components/common/table.vue";
import Tbody from "@zoobzio/foundation/components/common/tbody.vue";
import Td from "@zoobzio/foundation/components/common/td.vue";
import Th from "@zoobzio/foundation/components/common/th.vue";
import Thead from "@zoobzio/foundation/components/common/thead.vue";
import Tr from "@zoobzio/foundation/components/common/tr.vue";
import Ul from "@zoobzio/foundation/components/common/ul.vue";

import ConnectCard from "~/components/markdown/ConnectCard.vue";
import ConnectGrid from "~/components/markdown/ConnectGrid.vue";
import MapEmbed from "~/components/markdown/MapEmbed.vue";
import MarkdownAnchor from "~/components/markdown/MarkdownAnchor.vue";
import VisitCallout from "~/components/markdown/VisitCallout.vue";

/**
 * Tag → component map for ContentRenderer (used with `prose: false`).
 * Markdown renders through foundation components so every element carries
 * its f-* class; MDC block components carry the app-level classes.
 */
export const MARKDOWN_COMPONENTS: Record<string, Component> = {
  a: MarkdownAnchor,
  blockquote: Blockquote,
  code: Code,
  em: Em,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  hr: Hr,
  img: Img,
  li: Li,
  ol: Ol,
  p: P,
  pre: Pre,
  strong: Strong,
  table: Table,
  tbody: Tbody,
  td: Td,
  th: Th,
  thead: Thead,
  tr: Tr,
  ul: Ul,

  "connect-card": ConnectCard,
  "connect-grid": ConnectGrid,
  "map-embed": MapEmbed,
  "visit-callout": VisitCallout,
};
