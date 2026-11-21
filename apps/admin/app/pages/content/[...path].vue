<script lang="ts">
import { createError, definePageMeta, useNuxtApp } from "#imports";

import ContentDocument from "~/components/ContentDocument.vue";
import ContentFolder from "~/components/ContentFolder.vue";
import {
  useContentBrowser,
  useContentPath,
  useContentRequest,
} from "~/composables/content/browser";
import { useContentViews } from "~/composables/content/views";
import { useViewsRequest } from "~/composables/views";
</script>

<script setup lang="ts">
definePageMeta({ middleware: "auth", auth: { scopes: ["content:read"] } });

const { $t } = useNuxtApp();

/*
 * The page's address is a path of the content: the names of the folders
 * from the top down, and last, for a document, its slug. The content's own
 * page is the top, the path of no steps.
 */
const path = useContentPath();

const browser = useContentBrowser();
const views = useContentViews(browser);

/*
 * The saved views load before the path is asked for: the open one is put
 * in place first, so the one request reads its sort and its search.
 */
await useViewsRequest(views);

/*
 * What the path names, asked for in one request: a folder, which is
 * browsed, or a document, which is edited. A path that names neither is
 * not found.
 */
const { data: resource } = await useContentRequest(browser, path);

if (!resource.value) {
  throw createError({ statusCode: 404, message: $t.admin.content.notFound() });
}
</script>

<template>
  <ContentFolder
    v-if="resource?.kind === 'folder'"
    :browser="browser"
    :views="views"
  />
  <ContentDocument
    v-else-if="resource"
    :record="resource.record"
    :folder="path.slice(0, -1)"
  />
</template>
