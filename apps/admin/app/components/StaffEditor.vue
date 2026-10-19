<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import RecordForm from "~/components/RecordForm.vue";
import { useStaffEditor } from "~/composables/staff";
import { STATUS_OPTIONS } from "~/constants/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffEditor" });

// The member to edit, or none: a new one.
const { record } = defineProps<{ record: StaffRecord | null }>();

const { draft, saving, removing, error, removable, submit, destroy } =
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
      <label for="staff-name">Name</label>
      <input id="staff-name" v-model="draft.name" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="staff-role">Role</label>
      <input id="staff-role" v-model="draft.role" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="staff-slug">Slug</label>
      <input id="staff-slug" v-model="draft.slug" type="text" required />
      <span class="record-form-hint">Lowercase words joined by hyphens.</span>
    </div>
    <div class="record-form-field">
      <label for="staff-status">Status</label>
      <select id="staff-status" v-model="draft.status">
        <option
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <div class="record-form-field">
      <label for="staff-position">Position</label>
      <input
        id="staff-position"
        v-model.number="draft.position"
        type="number"
        min="0"
        step="1"
      />
      <span class="record-form-hint"
        >Where they stand in the list, lowest first.</span
      >
    </div>
    <div class="record-form-field">
      <label for="staff-photo">Photo URL</label>
      <input id="staff-photo" v-model="draft.photo" type="url" />
    </div>
    <div class="record-form-field">
      <label for="staff-email">Email</label>
      <input id="staff-email" v-model="draft.email" type="email" />
    </div>
    <div class="record-form-field">
      <label for="staff-phone">Phone</label>
      <input id="staff-phone" v-model="draft.phone" type="tel" />
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="staff-summary">Summary</label>
      <input id="staff-summary" v-model="draft.summary" type="text" />
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="staff-bio">Bio</label>
      <textarea id="staff-bio" v-model="draft.bio" rows="12" />
      <span class="record-form-hint">Markdown, for their own page.</span>
    </div>
  </RecordForm>
</template>
