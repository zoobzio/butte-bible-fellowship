<script lang="ts">
import type { AppearanceForm } from "@bbf/schema/types";

import type { AppearanceEditor } from "~/types/settings";

import { SEED_PATTERN } from "@bbf/schema";
import { Form } from "#components";
import { useNuxtApp } from "#imports";
</script>

<script setup lang="ts">
defineOptions({ name: "AppearanceEditor" });

/*
 * The form of one section of how the site looks, as its composable builds
 * it, under the section's heading: a color for each ramp of the theme's
 * palette, or what a visitor starts with for each of the theme's modifiers.
 */
const { editor } = defineProps<{ editor: AppearanceEditor }>();

const { $t } = useNuxtApp();

/*
 * The sections are saved together, from the bar at the foot of their page:
 * the form keeps no button of its own.
 */
const { form, title, hint, colors } = editor;

type Key = keyof AppearanceForm;

/* What a color field holds, as it is typed. */
const typed = (key: Key): string => String(form.payload[key] ?? "").trim();

/*
 * The color a field holds, to show beside it: none until what is typed is
 * a color.
 */
const shown = (key: Key): string | undefined =>
  SEED_PATTERN.test(typed(key)) ? typed(key) : undefined;

const picked = (key: Key, hex: string): boolean =>
  typed(key).toLowerCase() === hex;

const pick = (key: Key, hex: string) => {
  form.set(key, hex as never);
};

/* The browser's own checks stay off: the schema's are the ones shown. */
const pt = { form: { novalidate: true } };
</script>

<template>
  <div class="appearance-editor">
    <div class="appearance-editor-group">
      <h2 class="appearance-editor-title">{{ title }}</h2>
      <p class="appearance-editor-hint">{{ hint }}</p>
    </div>
    <Form :service="form" :pt="pt">
      <!-- A color: its hex code, typed, or one of the theme's own, picked. -->
      <template #input="{ field, settings }">
        <div class="appearance-editor-color">
          <span
            class="appearance-editor-shown"
            :style="{ background: shown(field.key) }"
            aria-hidden="true"
          />
          <input
            v-bind="settings.input"
            class="f-input f-data-form-input"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
          />
        </div>
        <div
          class="appearance-editor-colors"
          role="group"
          :aria-label="$t.admin.appearance.themeColors()"
        >
          <button
            v-for="color in colors"
            :key="color.ramp"
            type="button"
            class="appearance-editor-pick"
            :style="{ background: color.hex }"
            :title="$t.admin.appearance.pick(color)"
            :aria-label="$t.admin.appearance.pick(color)"
            :aria-pressed="picked(field.key, color.hex)"
            @click="pick(field.key, color.hex)"
          />
        </div>
      </template>
      <template #footer>
        <!-- An empty slot would draw the form's own buttons in its place. -->
        <span hidden />
      </template>
    </Form>
  </div>
</template>

<style>
/* One column of fields under the section's heading, no wider than reads well. */
.appearance-editor {
  display: grid;
  gap: var(--space-5);
  min-width: 0;
  max-width: 32rem;
}

/* The page header names the settings; the form's own title would repeat it. */
.appearance-editor .f-data-form-toolbar {
  display: none;
}

.appearance-editor .f-data-form-grid {
  display: grid;
  gap: var(--space-5);
}

.appearance-editor .f-data-form-field {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.appearance-editor-group {
  display: grid;
  gap: var(--space-1);
}

.appearance-editor-title {
  margin: 0;
  font: var(--type-title);
  color: var(--on-surface-high-contrast);
}

.appearance-editor-title::before {
  content: none;
}

.appearance-editor-hint {
  margin: 0;
  color: var(--on-surface-muted);
  font-size: var(--label-size);
}

.appearance-editor .f-data-form-field-label {
  font: var(--type-label);
  font-variant-caps: all-small-caps;
  letter-spacing: calc(var(--type-label-letter-spacing) * 2);
  color: var(--on-surface-muted);
}

.appearance-editor .f-data-form-input,
.appearance-editor .f-select-trigger {
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

.appearance-editor .f-data-form-input:focus-visible,
.appearance-editor .f-select-trigger:focus-visible,
.appearance-editor-pick:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: var(--primary);
}

.appearance-editor .f-data-form-input[aria-invalid="true"] {
  border-color: var(--error);
}

/* A hex code reads in the face of code, each digit its own width. */
.appearance-editor .f-data-form-input {
  font-family: var(--font-mono);
}

/* The color a field holds stands before its code. */
.appearance-editor-color {
  display: flex;
  align-items: stretch;
  gap: var(--space-2);
}

.appearance-editor-shown {
  flex: none;
  width: 2.5rem;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-sm);
}

/* The theme's own colors, in a row under the field: any may be picked. */
.appearance-editor-colors {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.appearance-editor-pick {
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-full);
  cursor: pointer;
}

/* The one a field is set to is ringed. */
.appearance-editor-pick[aria-pressed="true"] {
  outline: 2px solid var(--on-surface-high-contrast);
  outline-offset: 2px;
}

/*
 * The select reads as the inputs do. The mark at its end that says it opens
 * is the layer's own icon: the app draws none of its own.
 */
.appearance-editor .f-select-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-align: left;
  cursor: pointer;
}

.appearance-editor .f-select-trigger > .f-span {
  flex: 1;
  min-height: 1lh;
}

.appearance-editor .f-select-trigger > svg {
  flex: none;
  color: var(--on-surface-muted);
}

.appearance-editor .f-data-form-field-hint,
.appearance-editor .f-data-form-field-error {
  font-size: var(--label-size);
}

.appearance-editor .f-data-form-field-hint {
  color: var(--on-surface-muted);
}

.appearance-editor .f-data-form-field-error {
  color: var(--error);
}
</style>
