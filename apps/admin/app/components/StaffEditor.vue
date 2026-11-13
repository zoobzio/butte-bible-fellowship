<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { Form } from "#components";
import { useNuxtApp } from "#imports";
import { useDraft } from "~/composables/drafts";
import { useStaffEditor } from "~/composables/staff/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffEditor" });

const { record } = defineProps<{ record: StaffRecord | null }>();

const emit = defineEmits<{ saved: [record: StaffRecord] }>();

const { $t } = useNuxtApp();

const { form, error, dirty, saving, save, reset } = useStaffEditor(
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

/* The browser's own checks stay off: the schema's are the ones shown. */
const pt = { form: { novalidate: true } };
</script>

<template>
  <div class="staff-editor">
    <Form :service="form" :pt="pt">
      <template #footer="{ settings }">
        <template v-if="!held">
          <p v-if="error" class="staff-editor-error" role="alert">
            {{ error }}
          </p>
          <button class="staff-editor-save" v-bind="settings.submit">
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
/* One column of a member's details, as narrow as the panel it stands in. */
.staff-editor .f-data-form {
  display: grid;
  gap: var(--space-6);
  max-width: 24rem;
}

/* The page header names the record; the form's own title would repeat it. */
.staff-editor .f-data-form-toolbar {
  display: none;
}

/* The fields stack: a column ignores the spans the form sets. */
.staff-editor .f-data-form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.staff-editor .f-data-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.staff-editor .f-data-form-field-label {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

/* A field that must be filled in is marked at its label. */
.staff-editor
  .f-data-form-field:has(:required, [aria-required="true"])
  .f-data-form-field-label::after {
  content: " *";
  color: var(--error);
}

.staff-editor .f-data-form-input,
.staff-editor .f-data-form-textarea,
.staff-editor .f-select-trigger {
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

.staff-editor .f-data-form-input:focus-visible,
.staff-editor .f-data-form-textarea:focus-visible,
.staff-editor .f-select-trigger:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.staff-editor .f-data-form-input[aria-invalid="true"],
.staff-editor .f-data-form-textarea[aria-invalid="true"] {
  border-color: var(--error);
}

/* The summary grows downward only: the column sets its width. */
.staff-editor .f-data-form-textarea {
  display: block;
  resize: vertical;
}

/*
 * The select reads as the inputs do. The mark at its end that says it opens
 * is the layer's own icon: the app draws none of its own.
 */
.staff-editor .f-select-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-align: left;
  cursor: pointer;
}

.staff-editor .f-select-trigger > .f-span {
  flex: 1;
  min-height: 1lh;
}

.staff-editor .f-select-trigger > svg {
  flex: none;
  color: var(--on-surface-muted);
}

.staff-editor .f-data-form-field-hint,
.staff-editor .f-data-form-field-error {
  font-size: var(--label-size);
}

.staff-editor .f-data-form-field-hint {
  color: var(--on-surface-muted);
}

.staff-editor .f-data-form-field-error {
  color: var(--error);
}

.staff-editor-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.staff-editor-save {
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

.staff-editor-save {
  background: var(--primary);
  color: var(--on-primary);
  box-shadow: var(--elevation-low);
}

.staff-editor-save:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
