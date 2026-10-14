<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import HomeHero from "~/components/HomeHero.vue";
import HomeSermons from "~/components/HomeSermons.vue";
import HomeWeek from "~/components/HomeWeek.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import { usePage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage();

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));
</script>

<template>
  <div v-if="page" class="home">
    <HomeHero v-if="page.hero" :hero="page.hero" />

    <section class="prose">
      <MarkdownBody :page="page" />
    </section>

    <HomeWeek />

    <HomeSermons />
  </div>
</template>

<style>
/* The page keeps the site's measure, as every page does: the hero, the
   article, the week and the sermons each fill it. */
.home {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.home .prose {
  width: auto;
  margin-inline: 0;
}
</style>
