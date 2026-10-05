<script lang="ts">
import { ContentRenderer, NuxtLink } from "#components";
import { computed, createError, useHead, useT, definePageMeta } from "#imports";

import { useRouteLocale } from "~/composables/locale";
import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { data: page } = await usePage();
const { localize } = useRouteLocale();

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: useT().page.notFound() });
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
          <NuxtLink v-if="hero.cta" :to="localize(hero.cta.to)" class="cta">
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
