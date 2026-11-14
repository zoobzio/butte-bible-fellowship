<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import SitePage from "~/components/SitePage.vue";
import { useConnectEditor } from "~/composables/site/connect";
import { useConnectRecord } from "~/composables/site/record";
import { CONNECT, body } from "~/composables/site/routes";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["site:read"] } });

const { $t } = useNuxtApp();

/* The site's connect page, which is one row: there to be changed, and never missing. */
const { data: record } = await useConnectRecord();

if (!record.value) {
  throw createError({
    statusCode: 404,
    message: $t.admin.pages.notFound(),
  });
}

const editor = useConnectEditor(record.value);
</script>

<template>
  <SitePage
    v-if="record"
    :editor="editor"
    :record="record"
    :address="body(CONNECT)"
  />
</template>
