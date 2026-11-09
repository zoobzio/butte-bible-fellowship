<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { Editor } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useEventBody } from "~/composables/events/body";
</script>

<script setup lang="ts">
defineOptions({ name: "EventBody" });

const { record } = defineProps<{ record: EventRecord }>();

const { $t } = useNuxtApp();

const { editor, view, editing, dirty, saving, error, save, cancel } =
  useEventBody(record);

const title = useId();

/* The writing is named by its heading, and invites a click while it is blank. */
const pt = computed(() => ({
  content: {
    "aria-labelledby": title,
    "data-placeholder": $t.admin.event.bodyEmpty(),
  },
}));
</script>

<template>
  <section class="event-body" :data-editing="editing || undefined">
    <h2 :id="title" class="event-body-title">{{ $t.admin.event.body() }}</h2>
    <Editor :key="view" :service="editor" :pt="pt" />
    <p v-if="error" class="event-body-error" role="alert">{{ error }}</p>
    <div v-if="editing" class="event-body-actions">
      <button
        type="button"
        class="event-body-save"
        :disabled="saving || !dirty"
        @click="save"
      >
        {{ saving ? $t.admin.editor.saving() : $t.admin.editor.save() }}
      </button>
      <button
        type="button"
        class="event-body-cancel"
        :disabled="saving"
        @click="cancel"
      >
        {{ $t.admin.editor.cancel() }}
      </button>
    </div>
  </section>
</template>

<style>
.event-body {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* The heading reads as the labels of the form beside it do. */
.event-body-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.event-body-title::before {
  content: none;
}

.event-body .f-data-editor {
  display: grid;
  gap: var(--space-2);
}

/* The toolbar belongs to the editor: a body being read shows none. */
.event-body .f-data-editor:not([data-mounted]) .f-data-editor-toolbar {
  display: none;
}

.event-body .f-data-editor-toolbar {
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
.event-body .f-data-editor-block,
.event-body .f-data-editor-tool {
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

.event-body .f-data-editor-toolbar svg {
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
}

/*
 * The dropdown names the block at the selection, so it keeps one width
 * as that name changes and the tools after it stay where they are.
 */
.event-body .f-data-editor-block {
  justify-content: space-between;
  min-width: 8rem;
  padding-inline: var(--space-3);
}

.event-body .f-data-editor-block > svg {
  color: var(--on-surface-muted);
}

/* The rule between one group of tools and the next. */
.event-body .f-data-editor-separator {
  align-self: stretch;
  width: 1px;
  margin-inline: var(--space-1);
  background: var(--rule);
}

.event-body .f-data-editor-tool[aria-pressed="true"] {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.event-body .f-data-editor-block:disabled,
.event-body .f-data-editor-tool:disabled {
  opacity: 0.6;
  cursor: default;
}

/*
 * Read, the body is a page with a border that only shows under the pointer
 * or the keyboard; edited, it is a field like the form's beside it.
 */
.event-body .f-data-editor-content {
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

.event-body .f-data-editor-content:hover,
.event-body .f-data-editor[data-mounted] .f-data-editor-content {
  border-color: var(--rule);
  background: var(--surface);
}

.event-body .f-data-editor-content:focus-visible,
.event-body .f-data-editor[data-mounted] .f-data-editor-content:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.event-body .f-data-editor-content > :first-child {
  margin-top: 0;
}

.event-body .f-data-editor-content > :last-child {
  margin-bottom: 0;
}

.event-body
  .f-data-editor[data-empty]:not([data-mounted])
  .f-data-editor-content::before {
  content: attr(data-placeholder);
  color: var(--on-surface-muted);
}

.event-body-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.event-body-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.event-body-save,
.event-body-cancel {
  padding: var(--space-3) var(--space-5);
  border: 1px var(--stroke-solid) transparent;
  border-radius: var(--shape-full);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
  transition:
    background var(--transition-base),
    color var(--transition-base);
}

.event-body-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.event-body-cancel {
  background: transparent;
  border-color: var(--rule);
  color: var(--on-surface);
}

.event-body-save:disabled,
.event-body-cancel:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
