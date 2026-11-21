<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";
import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import { computed, ref, useHead, useNuxtApp, useRoute } from "#imports";

import TableOfContents from "#layers/bbf/app/components/TableOfContents.vue";
import ContentBody from "~/components/ContentBody.vue";
import ContentEditor from "~/components/ContentEditor.vue";
import ContentMenu from "~/components/ContentMenu.vue";
import PageHeader from "~/components/PageHeader.vue";
import SaveBar from "~/components/SaveBar.vue";
import { endpoint } from "~/composables/content/routes";
import { useDrafts } from "~/composables/drafts";
import { browse } from "~/constants/content";
</script>

<script setup lang="ts">
defineOptions({ name: "ContentDocument" });

/*
 * A document of the content, edited: the document as the page around this
 * read it at its address, and the path of the folder it is filed in. Its
 * own path is that folder's, and its slug.
 */
const { record: read, folder } = defineProps<{
  record: ContentRecord;
  folder: string[];
}>();

const { $t } = useNuxtApp();
const route = useRoute();

/* The document as it was last saved, which names the page afresh. */
const record = ref(read);

useHead(() => ({ title: record.value.title }));

/*
 * The way back to the folder the document is filed in, named as the trail
 * names it, and the document's own pages, each a tab: the one, at its own
 * address.
 */
const back = computed(() => ({
  label: folder.at(-1) ?? $t.admin.content.title(),
  to: browse(folder),
  icon: "chevron-left" as const,
}));
const tabs = computed(() => [
  { label: $t.admin.content.page(), to: route.path },
]);

/*
 * Where what is written on the document is written, on its own: at the
 * path it was read at. A slug changed moves the document, and this page
 * with it, to another.
 */
const address = endpoint([...folder, read.slug]);

/*
 * The record is saved and reset as a whole, from one bar at the foot of
 * the screen: each panel hands in its own part of it.
 */
const { dirty, open, saving, errors, save, reset } = useDrafts();

/*
 * The page's table of contents, as the site lists it, which the writing
 * tells as it is written: under the metadata, to move about the page by.
 */
const contents = ref<OutlineEntry[]>([]);
</script>

<template>
  <PageHeader
    :title="record.title"
    :description="record.description"
    :back="back"
    :tabs="tabs"
  >
    <ContentMenu :record="record" :folder="folder" />
  </PageHeader>
  <div class="content-page">
    <div class="content-page-side">
      <ContentEditor
        :record="record"
        :folder="folder"
        @saved="record = $event"
      />
      <TableOfContents :entries="contents" />
    </div>
    <ContentBody
      :record="record"
      :address="address"
      @outline="contents = $event"
    />
    <SaveBar
      :dirty="dirty"
      :open="open"
      :saving="saving"
      :errors="errors"
      @save="save"
      @reset="reset"
    />
  </div>
</template>

<style>
/*
 * Two panels: the page's metadata, what its front matter was, over its
 * table of contents in a narrow column, and what is written on it in what
 * is left. Narrow, one follows the other.
 */
.content-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.content-page-side {
  display: grid;
  gap: var(--space-7);
  min-width: 0;
}

/*
 * The narrow column keeps to the screen as the wide one scrolls. It is at
 * least as tall as the screen under the header and holds to the screen's
 * foot from the row's end: short, that is its head held under the header;
 * taller than the screen, it scrolls until its foot shows and stays there.
 * The screen's foot is the bar that saves the record, which it clears.
 */
.content-page-side {
  position: sticky;
  bottom: calc(var(--action-bar-height) + var(--space-5));
  align-self: end;
  align-content: start;
  min-height: calc(
    100dvh - var(--header-height) - var(--action-bar-height) - 2 *
      var(--space-5)
  );
}

@media (max-width: 60rem) {
  .content-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .content-page-side {
    position: static;
    min-height: 0;
  }
}
</style>
