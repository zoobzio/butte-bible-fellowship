<script lang="ts">
import type { useContentBrowser } from "~/composables/content/browser";
import type { useContentViews } from "~/composables/content/views";

import { Browser, Dialog, Icon, NuxtLink, Views } from "#components";
import { computed, ref, useHead, useNuxtApp } from "#imports";

import ContentEditor from "~/components/ContentEditor.vue";
import FolderEditor from "~/components/FolderEditor.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useContentTasks } from "~/composables/content/tasks";
import { browse } from "~/constants/content";
</script>

<script setup lang="ts">
defineOptions({ name: "ContentFolder" });

/*
 * A folder of the content, browsed: the browser, which the page around
 * this stood in the folder its address names and filled with what it
 * holds, and the saved views over it, its sort and its search under a
 * name, the admin's own first and then whoever is signed in's, each a tab.
 * One picked is put in place in the folder that is open.
 */
const { browser, views } = defineProps<{
  browser: ReturnType<typeof useContentBrowser>;
  views: ReturnType<typeof useContentViews>;
}>();

const { $t } = useNuxtApp();

useHead(() => ({ title: $t.admin.content.title() }));

/*
 * The address is where the browser stands: a folder's row and a crumb of
 * the trail are links to the folder's own page, which lists it. So a crumb
 * picked moves nothing here, and is left to its link.
 */
const pt = { head: { breadcrumb: { onSelect: () => {} } } };

/*
 * What the rows ask for, carried out on the folder that is open: a folder
 * renamed or removed, a document or a folder moved, picked up on its row
 * and put down in whichever folder is opened next, and the documents and
 * folders selected removed together, once asked about.
 */
const {
  here,
  busy,
  error,
  renaming,
  renamed,
  cancel,
  held,
  droppable,
  drop,
  release,
} = useContentTasks(browser);

/*
 * A new document, or a new folder, is written in a dialog over the browser, and
 * made in the folder that is open. Its form is drawn only while it is open,
 * so each opening starts blank; a document saved leads on to its own page, and
 * a folder saved shuts the dialog on the folder listed afresh.
 */
const adding = ref<"document" | "folder" | null>(null);

const posting = computed({
  get: () => adding.value === "document",
  set: (open) => {
    adding.value = open ? "document" : null;
  },
});

/* One dialog holds a folder's form: a new folder's, or one being renamed. */
const naming = computed({
  get: () => adding.value === "folder" || renaming.value !== null,
  set: (open) => {
    if (open) return;
    adding.value = null;
    cancel();
  },
});

const named = async () => {
  adding.value = null;
  await renamed();
};
</script>

<template>
  <PageHeader
    :title="$t.admin.content.title()"
    :description="$t.admin.content.description()"
    :action="$t.admin.content.new()"
    @action="adding = 'document'"
  >
    <button type="button" class="content-new-folder" @click="adding = 'folder'">
      {{ $t.admin.content.newFolder() }}
    </button>
  </PageHeader>
  <div v-if="held" class="content-move" role="status">
    <p class="content-move-text">
      {{ $t.admin.content.moving({ name: held.name }) }}
    </p>
    <button
      type="button"
      class="content-move-drop"
      :disabled="busy || !droppable"
      @click="drop"
    >
      {{ $t.admin.content.moveHere() }}
    </button>
    <button type="button" class="content-move-release" @click="release">
      {{ $t.admin.editor.cancel() }}
    </button>
  </div>
  <p v-if="error" class="content-error" role="alert">{{ error }}</p>
  <Views :service="views" />
  <Browser :service="browser" :pt="pt">
    <template #folder="{ folder }">
      <NuxtLink
        :to="browse([...here, folder.key])"
        class="f-button f-data-browser-folder-btn"
      >
        <Icon name="folder" aria-hidden="true" />
        <span class="f-span">{{ folder.label }}</span>
      </NuxtLink>
    </template>
    <template #cell:title="{ row }">
      <NuxtLink :to="browse([...here, row.slug])" class="f-anchor">
        {{ row.title }}
      </NuxtLink>
    </template>
  </Browser>
  <Dialog
    v-model:open="posting"
    :title="$t.admin.content.new()"
    :description="$t.admin.content.newDescription()"
  >
    <button
      type="button"
      class="content-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="posting = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <ContentEditor :record="null" :folder="here" />
  </Dialog>
  <Dialog
    v-model:open="naming"
    :title="
      renaming ? $t.admin.content.renameFolder() : $t.admin.content.newFolder()
    "
    :description="
      renaming
        ? $t.admin.content.renameFolderDescription()
        : $t.admin.content.newFolderDescription()
    "
  >
    <button
      type="button"
      class="content-new-close"
      :aria-label="$t.admin.editor.cancel()"
      @click="naming = false"
    >
      <Icon name="x" aria-hidden="true" />
    </button>
    <FolderEditor :folder="renaming" :parent="here" @saved="named" />
  </Dialog>
</template>

<style>
/* The way out of a dialog, in its corner, level with its title. */
.content-new-close {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  display: grid;
  place-items: center;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.content-new-close:hover {
  color: var(--on-surface-high-contrast);
}

.content-new-close svg {
  display: block;
  width: var(--space-4);
  height: var(--space-4);
}

/*
 * The way to a new folder, beside the way to a new document and second to it:
 * outlined where that one is filled. What a move puts down or lets go of
 * is dressed the same.
 */
.content-new-folder,
.content-move-drop,
.content-move-release {
  padding: var(--space-2) var(--space-4);
  border: 1px var(--stroke-solid) var(--rule);
  border-radius: var(--shape-full);
  background: transparent;
  color: var(--on-surface);
  font: var(--type-label);
  font-weight: var(--weight-medium);
  letter-spacing: var(--type-label-letter-spacing);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.content-new-folder:hover,
.content-move-drop:hover:not(:disabled),
.content-move-release:hover {
  color: var(--on-surface-high-contrast);
  border-color: color-mix(in oklab, var(--primary) 65%, transparent);
}

/*
 * What is being moved, over the browser, for as long as it is held: what
 * it is and what to do with it, then the way to put it down here and the
 * way to let it go.
 */
.content-move {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-md);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

.content-move-text {
  flex: 1;
  min-width: 12rem;
  margin: 0;
}

.content-move-drop {
  border-color: transparent;
  background: var(--primary);
  color: var(--on-primary);
}

.content-move-drop:hover:not(:disabled) {
  color: var(--on-primary);
}

.content-move-drop:disabled {
  opacity: 0.6;
  cursor: default;
}

.content-error {
  margin: 0 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--shape-sm);
  background: var(--error-container);
  color: var(--on-error-container);
}
</style>
