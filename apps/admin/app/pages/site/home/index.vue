<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* The page's address alone opens its first tab: its content. */
definePageMeta({ redirect: { path: "/site/home/content" } });
</script>

<template>
  <div />
</template>
