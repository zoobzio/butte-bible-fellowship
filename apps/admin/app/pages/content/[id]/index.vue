<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* A page's address alone opens its first page: the page itself. */
definePageMeta({
  redirect: (to) => ({ path: `/content/${String(to.params.id)}/page` }),
});
</script>

<template>
  <div />
</template>
