<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import SitePage from "~/components/SitePage.vue";
import { useAboutEditor } from "~/composables/site/about";
import { useAboutRecord } from "~/composables/site/record";
import { ABOUT, body } from "~/composables/site/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["site:read"] } });

const { $t } = useNuxtApp();

/* The site's About Us page, which is one row: there to be changed, and never missing. */
const { data: record } = await useAboutRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.pages.notFound(),
  });
}

const editor = useAboutEditor(record.value);
</script>

<template>
  <SitePage
    v-if="record"
    :editor="editor"
    :record="record"
    :address="body(ABOUT)"
  />
</template>
