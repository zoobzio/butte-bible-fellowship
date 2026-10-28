<script lang="ts">
import {
  computed,
  createError,
  definePageMeta,
  useHead,
  useNuxtApp,
} from "#imports";

import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import { usePage } from "~/composables/page";
import { useStaff } from "~/composables/staff";
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

const { data } = await useStaff();
const staff = computed(() => data.value ?? []);
</script>

<template>
  <div v-if="page" class="connect">
    <PageHeader
      :title="$t.connect.title()"
      :description="$t.connect.description()"
    />
    <section v-if="staff.length" class="connect-staff">
      <StaffCard v-for="member in staff" :key="member.slug" :member="member" />
    </section>
    <article class="prose">
      <MarkdownBody :page="page" />
    </article>
  </div>
</template>

<style>
.connect {
  width: min(100% - var(--site-gutter), var(--site-width));
  margin-inline: auto;
}

.connect-staff {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
  gap: var(--space-7) var(--space-6);
  padding-top: var(--space-7);
}

.connect .prose {
  width: auto;
  margin-inline: 0;
  padding-block: 0 clamp(var(--space-7), 7vw, var(--space-9));
}

.connect .prose > .connect-grid {
  margin-top: var(--space-6);
}
</style>
