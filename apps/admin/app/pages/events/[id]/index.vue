<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* An event's address alone opens its first page: the details. */
definePageMeta({
  redirect: (to) => ({ path: `/events/${String(to.params.id)}/details` }),
});
</script>

<template>
  <div />
</template>
