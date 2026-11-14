<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import HomeImage from "~/components/HomeImage.vue";
import SettingsPage from "~/components/SettingsPage.vue";
import { useHomeEditor } from "~/composables/settings/home";
import { useHomeRecord } from "~/composables/settings/record";
import { HOME, body } from "~/composables/settings/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["settings:read"] } });

const { $t } = useNuxtApp();

/* The site's home page, which is one row: there to be changed, and never missing. */
const { data: record } = await useHomeRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.settings.notFound(),
  });
}

const editor = useHomeEditor(record.value);
</script>

<template>
  <SettingsPage
    v-if="record"
    :editor="editor"
    :record="record"
    :address="body(HOME)"
  >
    <HomeImage :record="record" />
  </SettingsPage>
</template>
