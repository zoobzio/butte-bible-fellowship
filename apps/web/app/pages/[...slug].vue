<script lang="ts">
import { ContentRenderer } from "#components";
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { data: page } = await usePage();

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: useNuxtApp().$t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));
</script>

<template>
  <article v-if="page" class="prose">
    <ContentRenderer
      :value="page"
      :components="MARKDOWN_COMPONENTS"
      :prose="false"
    />
  </article>
</template>
