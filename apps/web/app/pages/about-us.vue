<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import AboutArticle from "~/components/AboutArticle.vue";
import { useAboutPage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await useAboutPage();

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

/* The tab reads as the other pages' do: the page, then the church. */
useHead(() => ({
  title: page.value && `${page.value.title} – ${$t.site.name()}`,
}));
</script>

<template>
  <AboutArticle v-if="page" :page="page" />
</template>
