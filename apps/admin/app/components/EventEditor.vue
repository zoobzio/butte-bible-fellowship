<script lang="ts">
import type { EventRecord } from "@bbf/schema/types";

import { useNuxtApp } from "#imports";
import RecordForm from "~/components/RecordForm.vue";
import { useEventEditor } from "~/composables/events";
import { DAY_OPTIONS, KIND_OPTIONS, STATUS_OPTIONS } from "~/constants/editor";
</script>

<script setup lang="ts">
defineOptions({ name: "EventEditor" });

// The event to edit, or none: a new one.
const { record } = defineProps<{ record: EventRecord | null }>();

const { $t } = useNuxtApp();

const { draft, saving, removing, error, removable, submit, destroy } =
  useEventEditor(record);
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
      <label for="event-title">{{ $t.admin.event.title() }}</label>
      <input id="event-title" v-model="draft.title" type="text" required />
    </div>
    <div class="record-form-field">
      <label for="event-slug">{{ $t.admin.editor.slug() }}</label>
      <input id="event-slug" v-model="draft.slug" type="text" required />
      <span class="record-form-hint">{{ $t.admin.editor.slugHint() }}</span>
    </div>
    <div class="record-form-field">
      <label for="event-status">{{ $t.admin.editor.status() }}</label>
      <select id="event-status" v-model="draft.status">
        <option
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ $t(option.label) }}
        </option>
      </select>
    </div>
    <fieldset class="record-form-field record-form-choices">
      <legend class="record-form-legend">{{ $t.admin.event.held() }}</legend>
      <label
        v-for="option in KIND_OPTIONS"
        :key="option.value"
        class="record-form-choice"
      >
        <input
          v-model="draft.kind"
          type="radio"
          name="event-kind"
          :value="option.value"
        />
        {{ $t(option.label) }}
      </label>
    </fieldset>
    <div v-if="draft.kind === 'once'" class="record-form-field">
      <label for="event-date">{{ $t.admin.event.date() }}</label>
      <input id="event-date" v-model="draft.date" type="date" required />
    </div>
    <template v-else>
      <div class="record-form-field">
        <label for="event-day">{{ $t.admin.event.day() }}</label>
        <select id="event-day" v-model="draft.day">
          <option
            v-for="option in DAY_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ $t(option.label) }}
          </option>
        </select>
      </div>
      <div class="record-form-field">
        <label for="event-weeks">{{ $t.admin.event.weeks() }}</label>
        <input id="event-weeks" v-model="draft.weeks" type="text" />
        <span class="record-form-hint">{{ $t.admin.event.weeksHint() }}</span>
      </div>
    </template>
    <div class="record-form-field">
      <label for="event-start">{{ $t.admin.event.start() }}</label>
      <input id="event-start" v-model="draft.start" type="time" required />
    </div>
    <div class="record-form-field">
      <label for="event-end">{{ $t.admin.event.end() }}</label>
      <input id="event-end" v-model="draft.end" type="time" />
    </div>
    <div class="record-form-field">
      <label for="event-location">{{ $t.admin.event.location() }}</label>
      <input id="event-location" v-model="draft.location" type="text" />
      <span class="record-form-hint">{{ $t.admin.event.locationHint() }}</span>
    </div>
    <div class="record-form-field">
      <label for="event-image">{{ $t.admin.event.image() }}</label>
      <input id="event-image" v-model="draft.image" type="url" />
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="event-note">{{ $t.admin.event.note() }}</label>
      <input id="event-note" v-model="draft.note" type="text" />
      <span class="record-form-hint">{{ $t.admin.event.noteHint() }}</span>
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="event-summary">{{ $t.admin.editor.summary() }}</label>
      <input id="event-summary" v-model="draft.summary" type="text" />
    </div>
    <div class="record-form-field record-form-field-wide">
      <label for="event-body">{{ $t.admin.event.body() }}</label>
      <textarea id="event-body" v-model="draft.body" rows="12" />
      <span class="record-form-hint">{{ $t.admin.event.bodyHint() }}</span>
    </div>
  </RecordForm>
</template>
