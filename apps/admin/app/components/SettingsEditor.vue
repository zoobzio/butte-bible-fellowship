<script lang="ts">
import type { Metadata } from "~/types/editor";

import { Form } from "#components";
import { useId, useNuxtApp } from "#imports";
import { useDraft } from "~/composables/drafts";
</script>

<script setup lang="ts" generic="T">
defineOptions({ name: "SettingsEditor" });

/*
 * The form of the metadata of one of the site's own pages, the home page
 * or About Us, as the composable of that page builds it: the fields differ
 * from page to page, the panel does not.
 */
const { editor } = defineProps<{ editor: Metadata<T> }>();

const { $t } = useNuxtApp();

/*
 * The page is saved as a whole, from the bar at its foot: the form hands
 * itself in and keeps no button of its own.
 */
const { form, error, dirty, saving, save, reset } = editor;
useDraft({ dirty, open: dirty, saving, error, save, reset });

const title = useId();

/*
 * The browser's own checks stay off: the schema's are the ones shown. The
 * form is named by the heading over it.
 */
const pt = { form: { novalidate: true, "aria-labelledby": title } };
</script>

<template>
  <div class="settings-editor">
    <h2 :id="title" class="settings-editor-title">
      {{ $t.admin.page.metadata() }}
    </h2>
    <Form :service="form" :pt="pt">
      <template #footer>
        <!-- An empty slot would draw the form's own buttons in its place. -->
        <span hidden />
      </template>
    </Form>
  </div>
</template>

<style>
.settings-editor {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* The heading reads as the labels of the form under it do. */
.settings-editor-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.settings-editor-title::before {
  content: none;
}

/* One column of a page's metadata, as narrow as the panel it stands in. */
.settings-editor .f-data-form {
  display: grid;
  gap: var(--space-6);
  max-width: 24rem;
}

/* The heading over the form names it; the form's own title would repeat it. */
.settings-editor .f-data-form-toolbar {
  display: none;
}

/* The fields stack: a column ignores the spans the form sets. */
.settings-editor .f-data-form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.settings-editor .f-data-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.settings-editor .f-data-form-field-label {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

/* A field that must be filled in is marked at its label. */
.settings-editor
  .f-data-form-field:has(:required, [aria-required="true"])
  .f-data-form-field-label::after {
  content: " *";
  color: var(--error);
}

.settings-editor .f-data-form-input,
.settings-editor .f-data-form-textarea {
  box-sizing: border-box;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  transition: border-color var(--transition-fast);
}

.settings-editor .f-data-form-input:focus-visible,
.settings-editor .f-data-form-textarea:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.settings-editor .f-data-form-input[aria-invalid="true"],
.settings-editor .f-data-form-textarea[aria-invalid="true"] {
  border-color: var(--error);
}

/* A textarea grows downward only: the column sets its width. */
.settings-editor .f-data-form-textarea {
  display: block;
  resize: vertical;
}

.settings-editor .f-data-form-field-hint,
.settings-editor .f-data-form-field-error {
  font-size: var(--label-size);
}

.settings-editor .f-data-form-field-hint {
  color: var(--on-surface-muted);
}

.settings-editor .f-data-form-field-error {
  color: var(--error);
}
</style>
