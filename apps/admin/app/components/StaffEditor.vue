<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { Editor } from "#components";
import { useNuxtApp } from "#imports";
import RecordForm from "~/components/RecordForm.vue";
import { useStaffEditor } from "~/composables/staff";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "~/constants/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffEditor" });

const { record } = defineProps<{ record: StaffRecord | null }>();

const { $t } = useNuxtApp();

const { draft, bio, saving, removing, error, removable, submit, destroy } =
  useStaffEditor(record);
</script>

<template>
  <RecordForm
    :saving="saving"
    :removing="removing"
    :error="error"
    :removable="removable"
    @submit="submit"
    @remove="destroy"
  >
    <div class="record-form-field">
      <label for="staff-name">{{ $t.admin.member.name() }}</label>
      <input id="staff-name" v-model="draft.name" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="staff-role">{{ $t.admin.member.role() }}</label>
      <select id="staff-role" v-model="draft.role" required>
        <option value="" disabled />
        <option
          v-for="option in ROLE_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ $t(option.label) }}
        </option>
      </select>
    </div>
    <div class="record-form-field">
      <label for="staff-status">{{ $t.admin.editor.status() }}</label>
      <select id="staff-status" v-model="draft.status">
        <option
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ $t(option.label) }}
        </option>
      </select>
    </div>
    <div class="record-form-field">
      <label for="staff-photo">{{ $t.admin.member.photo() }}</label>
      <input id="staff-photo" v-model="draft.photo" type="url" />
    </div>
    <div class="record-form-field">
      <label for="staff-email">{{ $t.admin.member.email() }}</label>
      <input id="staff-email" v-model="draft.email" type="email" />
    </div>
    <div class="record-form-field">
      <label for="staff-phone">{{ $t.admin.member.phone() }}</label>
      <input id="staff-phone" v-model="draft.phone" type="tel" />
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="staff-summary">{{ $t.admin.editor.summary() }}</label>
      <input id="staff-summary" v-model="draft.summary" type="text" />
    </div>
    <div class="record-form-field record-form-field-wide staff-bio">
      <label id="staff-bio-label" for="staff-bio">
        {{ $t.admin.member.bio() }}
      </label>
      <Editor
        :service="bio"
        :pt="{
          content: { id: 'staff-bio', 'aria-labelledby': 'staff-bio-label' },
        }"
      />
    </div>
  </RecordForm>
</template>

<style>
.staff-bio .f-data-editor {
  display: grid;
  gap: var(--space-2);
}

.staff-bio .f-data-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.staff-bio .f-data-editor-tool {
  padding: var(--space-1) var(--space-2);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface);
  font: var(--type-label);
  cursor: pointer;
}

.staff-bio .f-data-editor-tool[aria-pressed="true"] {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.staff-bio .f-data-editor-tool:disabled {
  opacity: 0.6;
  cursor: default;
}

.staff-bio .f-data-editor-content {
  box-sizing: border-box;
  min-height: 16rem;
  padding: var(--space-3);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
  background: var(--surface);
  color: var(--on-surface-high-contrast);
  font: var(--type-body);
  transition: border-color var(--transition-fast);
}

.staff-bio .f-data-editor-content:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}
</style>
