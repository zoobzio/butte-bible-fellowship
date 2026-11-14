<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";
import type { OutlineEntry } from "#layers/bbf/app/types/outline";

import { Editor } from "#components";
import { computed, useId, useNuxtApp, useTemplateRef } from "#imports";
import { useDraft } from "~/composables/drafts";
import { useEditorOutline } from "~/composables/outline";
import { useContentBody } from "~/composables/content/body";
</script>

<script setup lang="ts">
defineOptions({ name: "ContentBody" });

const { record } = defineProps<{ record: ContentRecord }>();

/*
 * The page's table of contents, as it is written now: told once its
 * headings can be linked to, and again whenever it changes, for the page
 * around this to list beside the writing.
 */
const emit = defineEmits<{ outline: [entries: OutlineEntry[]] }>();

const { $t } = useNuxtApp();

const { editor, view, editing, outline, dirty, saving, error, save, cancel } =
  useContentBody(record);

/*
 * The page saves the record as a whole, from its bar: the body hands
 * itself in, with something to put back for as long as it is being edited.
 */
const open = computed(() => editing.value || dirty.value);
useDraft({ dirty, open, saving, error, save, reset: cancel });

const title = useId();

/* The writing is named by its heading, and invites a click while it is blank. */
const pt = computed(() => ({
  content: {
    "aria-labelledby": title,
    "data-placeholder": $t.admin.page.bodyEmpty(),
  },
}));

/* The outline is told once the headings under here can be linked to. */
useEditorOutline(
  useTemplateRef<HTMLElement>("root"),
  { editor, view, editing, outline },
  (entries) => emit("outline", entries),
);
</script>

<template>
  <section ref="root" class="content-body" :data-editing="editing || undefined">
    <h2 :id="title" class="content-body-title">{{ $t.admin.page.body() }}</h2>
    <Editor :key="view" :service="editor" :pt="pt" />
  </section>
</template>

<style>
.content-body {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* A heading scrolled to clears the toolbar, which keeps under the header. */
.content-body .f-data-editor-content [id] {
  scroll-margin-top: calc(var(--header-height) + 5rem);
}

/* The heading reads as the labels of the form beside it do. */
.content-body-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.content-body-title::before {
  content: none;
}

.content-body .f-data-editor {
  display: grid;
  gap: var(--space-5);
}

/*
 * The toolbar keeps to the screen's head as the writing scrolls beneath
 * it, tucked a pixel under the header, whose published height is rounded,
 * so nothing shows between the two. A rule at its foot parts it from the
 * writing, over which it is drawn as the header is.
 */
.content-body .f-data-editor-toolbar {
  position: sticky;
  top: calc(var(--header-height) - 1px);
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  padding-block: var(--space-3);
  border-bottom: 1px var(--stroke-solid) var(--rule);
  background: color-mix(in oklab, var(--surface) 88%, transparent);
  backdrop-filter: blur(var(--blur-sm)) saturate(1.2);
}

/*
 * The toolbar's controls: the block type's dropdown and a button per
 * tool, each tool an icon. The layer's icons are bare `svg` elements laid
 * out as blocks, so each control is a flex box that centers its own.
 */
.content-body .f-data-editor-block,
.content-body .f-data-editor-tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
}

.content-body .f-data-editor-toolbar svg {
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
}

/*
 * The dropdown names the block at the selection, so it keeps one width
 * as that name changes and the tools after it stay where they are.
 */
.content-body .f-data-editor-block {
  justify-content: space-between;
  min-width: 8rem;
  padding-inline: var(--space-3);
}

.content-body .f-data-editor-block > svg {
  color: var(--on-surface-muted);
}

/* The rule between one group of tools and the next. */
.content-body .f-data-editor-separator {
  align-self: stretch;
  width: 1px;
  margin-inline: var(--space-1);
  background: var(--rule);
}

.content-body .f-data-editor-tool[aria-pressed="true"] {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.content-body .f-data-editor-block:disabled,
.content-body .f-data-editor-tool:disabled {
  opacity: 0.6;
  cursor: default;
}

/*
 * The writing sits bare under its toolbar, read or edited: no box around
 * it, and nothing drawn on focus, the caret being the sign of that.
 */
.content-body .f-data-editor-content {
  min-height: 16rem;
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  cursor: text;
}

.content-body .f-data-editor-content:focus,
.content-body .f-data-editor-content:focus-visible,
.content-body .f-data-editor-content :focus-visible {
  outline: none;
}

.content-body .f-data-editor-content > :first-child {
  margin-top: 0;
}

.content-body .f-data-editor-content > :last-child {
  margin-bottom: 0;
}

/*
 * One of the site's blocks, a card or a map, which the site draws with a
 * component of its own: here a box named by its marker, around whatever is
 * written in it, so it can be told from the writing around it and is not
 * lost in an edit.
 */
.content-body .f-data-editor-content [data-directive] {
  display: grid;
  gap: var(--space-3);
  min-height: var(--space-6);
  margin-block: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px dashed var(--rule);
  border-radius: var(--shape-sm);
}

.content-body .f-data-editor-content [data-directive]::before {
  content: attr(data-directive);
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.content-body .f-data-editor-content [data-directive] > * {
  margin-block: 0;
}

.content-body
  .f-data-editor[data-empty]:not([data-mounted])
  .f-data-editor-content::before {
  content: attr(data-placeholder);
  color: var(--on-surface-muted);
}
</style>
