<script lang="ts">
import { ContentRenderer } from "#components";
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import { usePage } from "~/composables/page";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

const { data: page } = await usePage("/connect");

if (!page.value) {
  throw createError({
    statusCode: 404,
    message: $t.page.notFound(),
  });
}

useHead(() => ({ title: page.value?.title }));

// The page's front matter lists the staff, who lead the page; its body —
// how to reach and find the church — follows them.
const staff = computed(() => page.value?.staff ?? []);
</script>

<template>
  <div v-if="page" class="connect">
    <PageHeader
      :title="$t.connect.title()"
      :description="$t.connect.description()"
    />
    <section v-if="staff.length" class="connect-staff">
      <StaffCard
        v-for="(member, index) in staff"
        :key="index"
        :member="member"
      />
    </section>
    <article class="prose">
      <ContentRenderer
        :value="page"
        :components="MARKDOWN_COMPONENTS"
        :prose="false"
      />
    </article>
  </div>
</template>

<style>
.connect {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

/* The sermon grid's columns, a little narrower: a portrait is taller than
   a video, so the cards sit four across where the sermons sit three. */
.connect-staff {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  gap: var(--space-7) var(--space-6);
  padding-top: var(--space-7);
}

/* The page sets the measure, and the header has already opened it, so the
   article fills the page's width and runs on from the staff. */
.connect .prose {
  width: auto;
  margin-inline: 0;
  padding-block: 0 clamp(var(--space-7), 7vw, var(--space-9));
}

.connect .prose > .connect-grid {
  margin-top: var(--space-6);
}
</style>
