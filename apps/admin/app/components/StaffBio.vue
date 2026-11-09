<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { Editor } from "#components";
import { computed, useId, useNuxtApp } from "#imports";
import { useStaffBio } from "~/composables/staff/bio";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffBio" });

const { record } = defineProps<{ record: StaffRecord }>();

const { $t } = useNuxtApp();

const { editor, view, editing, dirty, saving, error, save, cancel } =
  useStaffBio(record);

const title = useId();

/* The bio is named by its heading, and invites a click while it is blank. */
const pt = computed(() => ({
  content: {
    "aria-labelledby": title,
    "data-placeholder": $t.admin.member.bioEmpty(),
  },
}));
</script>

<template>
  <section class="staff-bio" :data-editing="editing || undefined">
    <h2 :id="title" class="staff-bio-title">{{ $t.admin.member.bio() }}</h2>
    <Editor :key="view" :service="editor" :pt="pt" />
    <p v-if="error" class="staff-bio-error" role="alert">{{ error }}</p>
    <div v-if="editing" class="staff-bio-actions">
      <button
        type="button"
        class="staff-bio-save"
        :disabled="saving || !dirty"
        @click="save"
      >
        {{ saving ? $t.admin.editor.saving() : $t.admin.editor.save() }}
      </button>
      <button
        type="button"
        class="staff-bio-cancel"
        :disabled="saving"
        @click="cancel"
      >
        {{ $t.admin.editor.cancel() }}
      </button>
    </div>
  </section>
</template>

<style>
.staff-bio {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* The heading reads as the labels of the form beside it do. */
.staff-bio-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.staff-bio-title::before {
  content: none;
}

.staff-bio .f-data-editor {
  display: grid;
  gap: var(--space-2);
}

/* The toolbar belongs to the editor: a bio being read shows none. */
.staff-bio .f-data-editor:not([data-mounted]) .f-data-editor-toolbar {
  display: none;
}

.staff-bio .f-data-editor-toolbar {
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
.staff-bio .f-data-editor-block,
.staff-bio .f-data-editor-tool {
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

.staff-bio .f-data-editor-toolbar svg {
  flex: none;
  width: var(--space-4);
  height: var(--space-4);
}

/*
 * The dropdown names the block at the selection, so it keeps one width
 * as that name changes and the tools after it stay where they are.
 */
.staff-bio .f-data-editor-block {
  justify-content: space-between;
  min-width: 8rem;
  padding-inline: var(--space-3);
}

.staff-bio .f-data-editor-block > svg {
  color: var(--on-surface-muted);
}

/* The rule between one group of tools and the next. */
.staff-bio .f-data-editor-separator {
  align-self: stretch;
  width: 1px;
  margin-inline: var(--space-1);
  background: var(--rule);
}

.staff-bio .f-data-editor-tool[aria-pressed="true"] {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.staff-bio .f-data-editor-block:disabled,
.staff-bio .f-data-editor-tool:disabled {
  opacity: 0.6;
  cursor: default;
}

/*
 * Read, the bio is a page with a border that only shows under the pointer
 * or the keyboard; edited, it is a field like the form's beside it.
 */
.staff-bio .f-data-editor-content {
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

.staff-bio .f-data-editor-content:hover,
.staff-bio .f-data-editor[data-mounted] .f-data-editor-content {
  border-color: var(--rule);
  background: var(--surface);
}

.staff-bio .f-data-editor-content:focus-visible,
.staff-bio .f-data-editor[data-mounted] .f-data-editor-content:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.staff-bio .f-data-editor-content > :first-child {
  margin-top: 0;
}

.staff-bio .f-data-editor-content > :last-child {
  margin-bottom: 0;
}

.staff-bio
  .f-data-editor[data-empty]:not([data-mounted])
  .f-data-editor-content::before {
  content: attr(data-placeholder);
  color: var(--on-surface-muted);
}

.staff-bio-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.staff-bio-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.staff-bio-save,
.staff-bio-cancel {
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

.staff-bio-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.staff-bio-cancel {
  background: transparent;
  border-color: var(--rule);
  color: var(--on-surface);
}

.staff-bio-save:disabled,
.staff-bio-cancel:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
