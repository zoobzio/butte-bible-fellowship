<script lang="ts">
import type { BrowserFolder } from "~/types/content";

import { Form } from "#components";
import { useNuxtApp } from "#imports";
import { useFolderEditor } from "~/composables/content/folder";
</script>

<script setup lang="ts">
defineOptions({ name: "FolderEditor" });

/*
 * The folder to rename, or none for a new one, which is made inside the
 * folder at `parent`: the path of the folder that is open, the top's being
 * of no steps.
 */
const { folder, parent } = defineProps<{
  folder: BrowserFolder | null;
  parent: string[];
}>();

const emit = defineEmits<{ saved: [] }>();

const { $t } = useNuxtApp();

const { form, error } = useFolderEditor(folder, parent, () => emit("saved"));

/* The browser's own checks stay off: the schema's are the ones shown. */
const pt = { form: { novalidate: true } };
</script>

<template>
  <!-- A folder's form is dressed as a document's is: the one column of fields. -->
  <div class="content-editor folder-editor">
    <Form :service="form" :pt="pt">
      <template #footer="{ settings }">
        <p v-if="error" class="content-editor-error" role="alert">
          {{ error }}
        </p>
        <button class="content-editor-save" v-bind="settings.submit">
          {{
            form.submitting ? $t.admin.editor.saving() : $t.admin.editor.save()
          }}
        </button>
      </template>
    </Form>
  </div>
</template>
