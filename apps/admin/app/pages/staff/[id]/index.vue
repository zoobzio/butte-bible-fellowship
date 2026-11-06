<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* A member's address alone opens their first page: the profile. */
definePageMeta({
  redirect: (to) => ({ path: `/staff/${String(to.params.id)}/profile` }),
});
</script>

<template>
  <div />
</template>
