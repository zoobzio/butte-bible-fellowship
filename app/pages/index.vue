<script lang="ts">
import Hero from "@zoobzio/foundation/components/core/hero.vue";
import Anchor from "@zoobzio/foundation/components/common/anchor.vue";
import Section from "@zoobzio/foundation/components/common/section.vue";

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
      <Hero
        :tagline="hero.tagline"
        :tagline-highlight="hero.highlight"
        :description="hero.description"
      >
        <template #button>
          <Anchor
            v-if="hero.cta"
            :to="hero.cta.to"
            :label="hero.cta.label"
            class="cta"
          />
        </template>
      </Hero>
    </div>

    <Section class="prose">
      <ContentRenderer
        :value="page"
        :components="MARKDOWN_COMPONENTS"
        :prose="false"
      />
    </Section>
  </div>
</template>
