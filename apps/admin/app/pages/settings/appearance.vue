<script lang="ts">
import { NuxtPage } from "#components";
import { computed, createError, definePageMeta, useNuxtApp } from "#imports";

import LeaveDialog from "~/components/LeaveDialog.vue";
import SaveBar from "~/components/SaveBar.vue";
import SectionMenu from "~/components/SectionMenu.vue";
import { useLeaveGuard } from "~/composables/leave";
import { useAppearanceEditors } from "~/composables/settings/appearance";
import { useAppearanceRecord } from "~/composables/settings/record";
import { useSections } from "~/composables/settings/sections";
import { APPEARANCE_SECTIONS } from "~/constants/settings";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

const { $t } = useNuxtApp();

/*
 * How the site looks over what its theme says, which is one row: there to
 * be changed, and never missing.
 */
const { data: record } = await useAppearanceRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.appearance.notFound(),
  });
}

/*
 * Each section has a form of its own, held here, and the pages under this
 * one each draw theirs: what is changed in one stays as another is read,
 * and the bar at the foot saves and resets them together.
 */
const editors = useAppearanceEditors(record.value);
const { dirty, saving, errors, save, reset } = editors;

/*
 * The sections, listed in a menu beside the one being read, each with what
 * there is to say of its changes: a new one is added here.
 */
const sections = useSections(() => [
  {
    label: $t.admin.appearance.palette(),
    to: APPEARANCE_SECTIONS.palette,
    editor: editors.sections.palette,
  },
  {
    label: $t.admin.appearance.modifiers(),
    to: APPEARANCE_SECTIONS.modifiers,
    editor: editors.sections.modifiers,
  },
]);

/*
 * The settings left with changes not saved lose them: that is asked first.
 * A move from one section to another leaves nothing behind.
 */
const { asking, leave, stay } = useLeaveGuard(dirty);

const label = computed(() => $t.admin.appearance.sections());
</script>

<template>
  <div v-if="record" class="settings-appearance">
    <SectionMenu
      class="settings-appearance-menu"
      :label="label"
      :sections="sections"
    />
    <NuxtPage />
    <SaveBar
      :dirty="dirty"
      :open="dirty"
      :saving="saving"
      :errors="errors"
      @save="save"
      @reset="reset"
    />
    <LeaveDialog :open="asking" @stay="stay" @leave="leave" />
  </div>
</template>

<style>
/*
 * The menu of the sections in a narrow column, and the one being read in
 * what is left, over the bar that saves them. Narrow, the menu comes first.
 */
.settings-appearance {
  display: grid;
  grid-template-columns: minmax(0, 14rem) minmax(0, 1fr);
  align-items: start;
  gap: var(--space-6) var(--space-8);
}

/* The menu keeps to the screen, under the header, as its section scrolls. */
.settings-appearance-menu {
  position: sticky;
  top: calc(var(--header-height) + var(--space-5));
}

@media (max-width: 60rem) {
  .settings-appearance {
    grid-template-columns: minmax(0, 1fr);
  }

  .settings-appearance-menu {
    position: static;
  }
}
</style>
