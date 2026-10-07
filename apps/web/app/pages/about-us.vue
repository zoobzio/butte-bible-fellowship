<script lang="ts">
import { ContentRenderer } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import TableOfContents from "~/components/TableOfContents.vue";
import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import { outline } from "~/utils/outline";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage("/about-us");

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));

const entries = computed(() => (page.value ? outline(page.value.body) : []));
</script>

<template>
  <div v-if="page" class="about">
    <PageHeader
      :title="$t.about.title()"
      :description="$t.about.description()"
    />
    <aside class="about-contents">
      <TableOfContents :entries="entries" />
    </aside>
    <article class="prose">
      <ContentRenderer
        :value="page"
        :components="MARKDOWN_COMPONENTS"
        :prose="false"
      />
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

/* The header runs the width of both columns. */
.about .page-header {
  grid-column: 1 / -1;
}

/* The grid sets the measure here, so the article fills its column, and the
   header has already opened the page, so it starts closer under it. */
.about .prose {
  width: auto;
  margin-inline: 0;
  padding-top: var(--space-7);
}

/* Rides down the page with the reader once it meets the header, and
   scrolls on its own when it is taller than the room under it. */
.about-contents {
  position: sticky;
  top: var(--header-height);
  max-height: calc(100dvh - var(--header-height));
  overflow-y: auto;
  padding-block: var(--space-7) clamp(var(--space-7), 7vw, var(--space-9));
}

/* No room for a column beside the article: the contents lead it instead. */
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
