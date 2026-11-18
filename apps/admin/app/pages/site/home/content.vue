<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import SitePage from "~/components/SitePage.vue";
import { useHomeEditor } from "~/composables/site/home";
import { useHomeRecord } from "~/composables/site/record";
import { HOME, body } from "~/composables/site/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["site:read"] } });

const { $t } = useNuxtApp();

/* The site's home page, which is one row: there to be changed, and never missing. */
const { data: record } = await useHomeRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.pages.notFound(),
  });
}

const editor = useHomeEditor(record.value);
</script>

<template>
  <SitePage
    v-if="record"
    :editor="editor"
    :record="record"
    :address="body(HOME)"
  />
</template>
