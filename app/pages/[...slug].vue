<script lang="ts">
import Article from "@zoobzio/foundation/components/common/article.vue";

import {
  createError,
  queryCollection,
  useAsyncData,
  useHead,
  useRoute,
} from "#imports";

import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
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
  <Article v-if="page" class="prose">
    <ContentRenderer
      :value="page"
      :components="MARKDOWN_COMPONENTS"
      :prose="false"
    />
  </Article>
</template>
