<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import AboutArticle from "~/components/AboutArticle.vue";
import { usePage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage("/about-us");

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));
</script>

<template>
  <AboutArticle v-if="page" :page="page" />
</template>
