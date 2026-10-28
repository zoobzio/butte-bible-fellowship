<script lang="ts">
import type { StaffRecord } from "@bbf/schema/types";

import { useNuxtApp } from "#imports";
import RecordForm from "~/components/RecordForm.vue";
import { useStaffEditor } from "~/composables/staff";
import { STATUS_OPTIONS } from "~/constants/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "StaffEditor" });

// The member to edit, or none: a new one.
const { record } = defineProps<{ record: StaffRecord | null }>();

const { $t } = useNuxtApp();

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
      <label for="staff-name">{{ $t.admin.member.name() }}</label>
      <input id="staff-name" v-model="draft.name" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="staff-role">{{ $t.admin.member.role() }}</label>
      <input id="staff-role" v-model="draft.role" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="staff-slug">{{ $t.admin.editor.slug() }}</label>
      <input id="staff-slug" v-model="draft.slug" type="text" required />
      <span class="record-form-hint">{{ $t.admin.editor.slugHint() }}</span>
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
      <label for="staff-position">{{ $t.admin.member.position() }}</label>
      <input
        id="staff-position"
        v-model.number="draft.position"
        type="number"
        min="0"
        step="1"
      />
      <span class="record-form-hint">{{ $t.admin.member.positionHint() }}</span>
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
    <div class="record-form-field record-form-field-wide">
      <label for="staff-bio">{{ $t.admin.member.bio() }}</label>
      <textarea id="staff-bio" v-model="draft.bio" rows="12" />
      <span class="record-form-hint">{{ $t.admin.member.bioHint() }}</span>
    </div>
  </RecordForm>
</template>
