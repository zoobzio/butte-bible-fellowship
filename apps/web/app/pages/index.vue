<script lang="ts">
import {
  computed,
  createError,
  queryCollection,
  useAsyncData,
  useHead,
  definePageMeta,
} from "#imports";

import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { data: page } = await useAsyncData("page:home", () =>
  queryCollection("pages").path("/").first(),
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
}

useHead(() => ({ title: page.value?.title }));

const hero = computed(() => page.value?.hero);
</script>

<template>
  <div v-if="page">
    <div v-if="hero" class="home-hero">
      <section class="home-hero-body">
        <div class="home-hero-content">
          <h1>
            {{ hero.tagline }}
            <em v-if="hero.highlight">{{ hero.highlight }}</em>
          </h1>
          <p v-if="hero.description">{{ hero.description }}</p>
          <NuxtLink v-if="hero.cta" :to="hero.cta.to" class="cta">
            {{ hero.cta.label }}
          </NuxtLink>
        </div>
      </section>
    </div>

    <section class="prose">
      <ContentRenderer
        :value="page"
        :components="MARKDOWN_COMPONENTS"
        :prose="false"
      />
    </section>
  </div>
</template>
