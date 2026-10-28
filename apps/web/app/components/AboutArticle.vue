<script lang="ts">
import type { PageItem } from "~/types/page";

import { useNuxtApp } from "#imports";

import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import TableOfContents from "~/components/TableOfContents.vue";
import { useOutline } from "~/composables/outline";
</script>

<script setup lang="ts">
defineOptions({ name: "AboutArticle" });

const { page } = defineProps<{ page: PageItem }>();

const { $t } = useNuxtApp();
const entries = useOutline(() => page);
</script>

<template>
  <div class="about">
    <PageHeader
      :title="$t.about.title()"
      :description="$t.about.description()"
    />
    <aside class="about-contents">
      <TableOfContents :entries="entries" />
    </aside>
    <article class="prose">
      <MarkdownBody :page="page" />
    </article>
  </div>
</template>

<style>
.about {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  align-items: start;
  gap: clamp(var(--space-5), 3vw, var(--space-7));
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.about .page-header {
  grid-column: 1 / -1;
}

.about .prose {
  width: auto;
  margin-inline: 0;
  padding-top: var(--space-7);
}

.about-contents {
  position: sticky;
  top: var(--header-height);
  max-height: calc(100dvh - var(--header-height));
  overflow-y: auto;
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

@media (max-width: 60rem) {
  .about {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
  .about-contents {
    position: static;
    max-height: none;
    padding-bottom: 0;
  }
}
</style>
