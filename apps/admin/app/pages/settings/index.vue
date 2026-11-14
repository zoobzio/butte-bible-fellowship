<script lang="ts">
import { definePageMeta } from "#imports";
</script>

<script setup lang="ts">
/* The settings' address alone opens the first tab: the home page. */
definePageMeta({ redirect: { path: "/settings/home" } });
</script>

<template>
  <div />
</template>
