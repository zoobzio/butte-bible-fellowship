<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* A person's address alone opens their first page: the profile. */
definePageMeta({
  redirect: (to) => ({ path: `/people/${String(to.params.id)}/profile` }),
});
</script>

<template>
  <div />
</template>
