<script lang="ts">
import { ContentRenderer } from "#components";
import {
  createError,
  definePageMeta,
  queryCollection,
  useAsyncData,
  useHead,
  useRoute,
} from "#imports";

import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const route = useRoute();

const { data: page } = await useAsyncData(`page:${route.path}`, () =>
  queryCollection("pages").path(route.path).first(),
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
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
