<script lang="ts">
import type { ContentRecord } from "@bbf/schema/types";

import { Form } from "#components";
import { useId, useNuxtApp } from "#imports";
import { useDraft } from "~/composables/drafts";
import { useContentEditor } from "~/composables/content/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "ContentEditor" });

const { record } = defineProps<{ record: ContentRecord | null }>();

const emit = defineEmits<{ saved: [record: ContentRecord] }>();

const { $t } = useNuxtApp();

const { form, error, dirty, saving, save, reset } = useContentEditor(
  record,
  (saved) => emit("saved", saved),
);

/*
 * A record that exists is saved as a whole, from the bar of the page it is
 * on, when there is one: the form hands itself in and keeps no button. A
 * new record, in its dialog, saves from the form's own.
 */
const held =
  record !== null &&
  useDraft({ dirty, open: dirty, saving, error, save, reset });

const title = useId();

/*
 * The browser's own checks stay off: the schema's are the ones shown. The
 * form of a page that exists is named by the heading over it.
 */
const pt = {
  form: {
    novalidate: true,
    ...(record === null ? {} : { "aria-labelledby": title }),
  },
};
</script>

<template>
  <div class="content-editor">
    <h2 v-if="record" :id="title" class="content-editor-title">
      {{ $t.admin.page.metadata() }}
    </h2>
    <Form :service="form" :pt="pt">
      <template #footer="{ settings }">
        <template v-if="!held">
          <p v-if="error" class="content-editor-error" role="alert">
            {{ error }}
          </p>
          <button class="content-editor-save" v-bind="settings.submit">
            {{
              form.submitting
                ? $t.admin.editor.saving()
                : $t.admin.editor.save()
            }}
          </button>
        </template>
        <!-- An empty slot would draw the form's own buttons in its place. -->
        <span v-else hidden />
      </template>
    </Form>
  </div>
</template>

<style>
.content-editor {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* The heading reads as the labels of the form under it do. */
.content-editor-title {
  display: block;
  margin: 0;
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.content-editor-title::before {
  content: none;
}

/* One column of a page's metadata, as narrow as the panel it stands in. */
.content-editor .f-data-form {
  display: grid;
  gap: var(--space-6);
  max-width: 24rem;
}

/* The page header names the record; the form's own title would repeat it. */
.content-editor .f-data-form-toolbar {
  display: none;
}

/* The fields stack: a column ignores the spans the form sets. */
.content-editor .f-data-form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.content-editor .f-data-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.content-editor .f-data-form-field-label {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

/* A field that must be filled in is marked at its label. */
.content-editor
  .f-data-form-field:has(:required, [aria-required="true"])
  .f-data-form-field-label::after {
  content: " *";
  color: var(--error);
}

.content-editor .f-data-form-input,
.content-editor .f-data-form-textarea {
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

.content-editor .f-data-form-input:focus-visible,
.content-editor .f-data-form-textarea:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.content-editor .f-data-form-input[aria-invalid="true"],
.content-editor .f-data-form-textarea[aria-invalid="true"] {
  border-color: var(--error);
}

/* A textarea grows downward only: the column sets its width. */
.content-editor .f-data-form-textarea {
  display: block;
  resize: vertical;
}

.content-editor .f-data-form-field-hint,
.content-editor .f-data-form-field-error {
  font-size: var(--label-size);
}

.content-editor .f-data-form-field-hint {
  color: var(--on-surface-muted);
}

.content-editor .f-data-form-field-error {
  color: var(--error);
}

.content-editor-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.content-editor-save {
  justify-self: start;
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

.content-editor-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.content-editor-save:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
