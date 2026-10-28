<script lang="ts">
import type { PageItem } from "~/types/page";

import { Prose } from "#components";
</script>

<script setup lang="ts">
defineOptions({ name: "MarkdownBody" });

const { page } = defineProps<{ page: PageItem }>();
</script>

<template>
  <Prose :tree="page.body" />
</template>
