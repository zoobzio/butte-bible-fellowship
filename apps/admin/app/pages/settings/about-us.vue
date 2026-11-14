<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import SettingsPage from "~/components/SettingsPage.vue";
import { useAboutEditor } from "~/composables/settings/about";
import { useAboutRecord } from "~/composables/settings/record";
import { ABOUT, body } from "~/composables/settings/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

const { $t } = useNuxtApp();

/* The site's About Us page, which is one row: there to be changed, and never missing. */
const { data: record } = await useAboutRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.settings.notFound(),
  });
}

const editor = useAboutEditor(record.value);
</script>

<template>
  <SettingsPage
    v-if="record"
    :editor="editor"
    :record="record"
    :address="body(ABOUT)"
  />
</template>
