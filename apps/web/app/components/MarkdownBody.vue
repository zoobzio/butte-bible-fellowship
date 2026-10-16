<script lang="ts">
import type { PageItem } from "~/types/page";

import { Prose } from "#components";
</script>

<script setup lang="ts">
defineOptions({ name: "MarkdownBody" });

// A page's body: the tree the build made of it, rendered by the prosary
// module with the overrides under `components/prose/` — every link as a
// NuxtLink in the reader's locale, and the site's blocks as its cards and
// its map. Plain markdown renders as native HTML elements.
const { page } = defineProps<{ page: PageItem }>();
</script>

<template>
  <Prose :tree="page.body" />
</template>
