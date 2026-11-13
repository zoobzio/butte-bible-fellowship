<script lang="ts">
import { createError, definePageMeta, useHead, useNuxtApp } from "#imports";

import MarkdownBody from "~/components/MarkdownBody.vue";
import { usePage } from "~/composables/page";
</script>

<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { $t } = useNuxtApp();

/*
 * A page the admin wrote that has no layout of its own: what is written on
 * it, under its title. The pages with one are routes of their own, which
 * come before this.
 */
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
  <article v-if="page" class="prose">
    <MarkdownBody :page="page" />
  </article>
</template>
