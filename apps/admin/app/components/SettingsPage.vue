<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";
import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import type { Metadata } from "~/types/editor";

import { ref } from "#imports";

import TableOfContents from "#layers/bbf/app/components/TableOfContents.vue";
import ContentBody from "~/components/ContentBody.vue";
import SaveBar from "~/components/SaveBar.vue";
import SettingsEditor from "~/components/SettingsEditor.vue";
import { useDrafts } from "~/composables/drafts";
</script>

<script setup lang="ts" generic="T">
defineOptions({ name: "SettingsPage" });

/*
 * One of the site's own pages, the home page or About Us, as its tab of
 * the settings edits it: the form of its metadata, which the tab builds,
 * the page itself for what is written on it, and where that is written.
 */
const { editor, record, address } = defineProps<{
  editor: Metadata<T>;
  record: Pick<ContentRecord, "body">;
  address: string;
}>();

/* What else a page keeps beside its metadata, over it: a picture, say. */
defineSlots<{ default?: () => unknown }>();

/*
 * The page is saved and reset as a whole, from one bar at the foot of the
 * screen: each panel hands in its own part of it.
 */
const { dirty, open, saving, errors, save, reset } = useDrafts();

/*
 * The page's table of contents, as the site lists it, which the writing
 * tells as it is written: under the metadata, to move about the page by.
 */
const contents = ref<OutlineEntry[]>([]);
</script>

<template>
  <div class="settings-page">
    <div class="settings-page-side">
      <slot />
      <SettingsEditor :editor="editor" />
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
 * Two panels, as a page written in the admin has: the page's metadata
 * over its table of contents in a narrow column, and what is written on
 * it in what is left. Narrow, one follows the other.
 */
.settings-page {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

.settings-page-side {
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
.settings-page-side {
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
  .settings-page {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings-page-side {
    position: static;
    min-height: 0;
  }
}
</style>
