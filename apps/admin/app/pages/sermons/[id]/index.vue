<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* A sermon's address alone opens its first page: the details. */
definePageMeta({
  redirect: (to) => ({ path: `/sermons/${String(to.params.id)}/details` }),
});
</script>

<template>
  <div />
</template>
