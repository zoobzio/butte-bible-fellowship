<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { Form } from "#components";
import { useNuxtApp } from "#imports";
import { useStaffEditor } from "~/composables/staff/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffEditor" });

const { record } = defineProps<{ record: StaffRecord | null }>();

const { $t } = useNuxtApp();

const { form, error, removing, removable, destroy } = useStaffEditor(record);

/* The browser's own checks stay off: the schema's are the ones shown. */
const pt = { form: { novalidate: true } };
</script>

<template>
  <div class="staff-editor">
    <Form :service="form" :pt="pt">
      <template #footer="{ settings }">
        <p v-if="error" class="staff-editor-error" role="alert">{{ error }}</p>
        <div class="staff-editor-actions">
          <button
            class="staff-editor-save"
            v-bind="settings.submit"
            :disabled="form.submitting || removing"
          >
            {{
              form.submitting
                ? $t.admin.editor.saving()
                : $t.admin.editor.save()
            }}
          </button>
          <button
            v-if="removable"
            type="button"
            class="staff-editor-delete"
            :disabled="form.submitting || removing"
            @click="destroy"
          >
            {{
              removing ? $t.admin.editor.deleting() : $t.admin.editor.delete()
            }}
          </button>
        </div>
      </template>
    </Form>
  </div>
</template>

<style>
.staff-editor .f-data-form {
  display: grid;
  gap: var(--space-6);
  max-width: 44rem;
}

/* The page header names the record; the form's own title would repeat it. */
.staff-editor .f-data-form-toolbar {
  display: none;
}

.staff-editor .f-data-form-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-4) var(--space-5);
}

/* Narrow, the fields stack: a column ignores the spans the form sets. */
@media (max-width: 40rem) {
  .staff-editor .f-data-form-grid {
    display: flex;
    flex-direction: column;
  }
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

.staff-editor .f-data-form-input,
.staff-editor .f-select-trigger,
.staff-editor .f-data-editor-content {
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
.staff-editor .f-select-trigger:focus-visible,
.staff-editor .f-data-editor-content:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.staff-editor .f-data-form-input[aria-invalid="true"],
.staff-editor .f-data-editor-content[aria-invalid="true"] {
  border-color: var(--error);
}

/* The select reads as the inputs do, a mark at the end to say it opens. */
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

.staff-editor .f-select-trigger::after {
  content: "\25BE";
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

.staff-editor .f-data-editor {
  display: grid;
  gap: var(--space-2);
}

.staff-editor .f-data-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.staff-editor .f-data-editor-tool {
  padding: var(--space-1) var(--space-2);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
}

.staff-editor .f-data-editor-tool[aria-pressed="true"] {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.staff-editor .f-data-editor-tool:disabled {
  opacity: 0.6;
  cursor: default;
}

.staff-editor .f-data-editor-content {
  min-height: 16rem;
  padding: var(--space-3);
}

.staff-editor-error {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}

.staff-editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.staff-editor-save,
.staff-editor-delete {
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

.staff-editor-delete {
  margin-left: auto;
  background: transparent;
  border-color: var(--rule);
  color: var(--error);
}

.staff-editor-delete:hover:not(:disabled) {
  background: var(--error-container);
  color: var(--on-error-container);
}

.staff-editor-save:disabled,
.staff-editor-delete:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
