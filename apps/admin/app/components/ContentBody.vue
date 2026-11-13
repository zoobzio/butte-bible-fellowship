<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";

import { Editor } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useDraft } from "~/composables/drafts";
import { useContentBody } from "~/composables/content/body";
</script>

<script setup lang="ts">
defineOptions({ name: "ContentBody" });

const { record } = defineProps<{ record: ContentRecord }>();

const { $t } = useNuxtApp();

const { editor, view, editing, dirty, saving, error, save, cancel } =
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
</script>

<template>
  <section class="content-body" :data-editing="editing || undefined">
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
  gap: var(--space-2);
}

/* The toolbar belongs to the editor: a body being read shows none. */
.content-body .f-data-editor:not([data-mounted]) .f-data-editor-toolbar {
  display: none;
}

.content-body .f-data-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
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
 * Read, the body is a page with a border that only shows under the pointer
 * or the keyboard; edited, it is a field like the form's beside it.
 */
.content-body .f-data-editor-content {
  box-sizing: border-box;
  min-height: 16rem;
  padding: var(--space-3) var(--space-4);
  border: 1px var(--stroke-solid) transparent;
  border-radius: var(--shape-sm);
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  cursor: text;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
}

.content-body .f-data-editor-content:hover,
.content-body .f-data-editor[data-mounted] .f-data-editor-content {
  border-color: var(--rule);
  background: var(--surface);
}

.content-body .f-data-editor-content:focus-visible,
.content-body .f-data-editor[data-mounted] .f-data-editor-content:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
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
