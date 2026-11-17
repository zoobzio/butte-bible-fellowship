import type { ContentRecord } from "@bbf/schema/types";

import type { BrowserFetch } from "~/types/content";

import { contentRecords, folderRecords } from "@bbf/schema";
import { createBrowser, navigateTo, useRequest } from "#imports";
import { useApi } from "~/composables/api";
import { FOLDERS, ROUTE } from "~/composables/content/routes";
import { useContentRequests } from "~/composables/content/tasks";
import { CONTENT_BROWSER, link } from "~/constants/content";
import {
  folderId,
  folderOf,
  toBrowserFolder,
  toContentQuery,
  toFoldersQuery,
} from "~/utils/folders";

/**
 * What the open folder holds, over the admin's API: the folders inside it
 * and the documents filed in it, asked for together.
 */
export const useFolderFetch = (): BrowserFetch<ContentRecord> => {
  const api = useApi();

  return async (params) => {
    const [folders, files] = await Promise.all([
      api(FOLDERS, { query: toFoldersQuery(params) }),
      api(ROUTE, { query: toContentQuery(params) }),
    ]);
    return {
      folders: folderRecords.parse(folders).map(toBrowserFolder),
      files: contentRecords.parse(files),
    };
  };
};

/**
 * The content browser: the config of the constants over the admin's API. A
 * document's edit is the way to its editor. Its move, and a folder's rename,
 * move and delete, are left as requests for the content page to carry out,
 * each of a move with the folder it was picked up in. The rows select,
 * folders and documents alike, and the removal of the ones selected is
 * left as a request too. The layer's factory
 * names the columns, the actions and the root from the prose as the
 * browser is built in setup, in the visitor's locale.
 */
export const useContentBrowser = createBrowser<ContentRecord>("content", {
  ...CONTENT_BROWSER,
  fetch: useFolderFetch(),
  actions: {
    edit: {
      label: "admin.editor.edit",
      action: (record) => {
        navigateTo(link(record));
      },
    },
    move: {
      label: "admin.content.move",
      action: (record) => {
        useContentRequests().value.held = {
          kind: "document",
          id: record.id,
          name: record.title,
          from: record.folder,
        };
      },
    },
  },
  folderActions: {
    rename: {
      label: "admin.content.rename",
      action: (asked) => {
        useContentRequests().value.renaming = asked;
      },
    },
    move: {
      label: "admin.content.move",
      action: (asked) => {
        useContentRequests().value.held = {
          kind: "folder",
          id: folderId(asked),
          name: asked.label,
          from: folderOf(useContentBrowser().pathKeys),
        };
      },
    },
    remove: {
      label: "admin.editor.delete",
      icon: "remove",
      action: (asked) => {
        useContentRequests().value.removing = asked;
      },
    },
  },
  bulkActions: {
    remove: {
      label: "admin.editor.delete",
      action: (selected, folders) => {
        useContentRequests().value.removingSelected = {
          documents: [...selected],
          folders: [...folders],
        };
      },
    },
  },
});

/**
 * Lists the open folder for the page the browser sits on. Every visit
 * fetches: the browser's state outlives the page, the folder that was open
 * with it, and what it held may have changed since. Its own `init` fetches
 * once only, and is what marks it as having listed anything at all, which
 * a folder's emptiness waits on: so the first visit goes through it.
 */
export const useBrowserRequest = (
  browser: ReturnType<typeof useContentBrowser>,
) =>
  useRequest(`browser:${browser.id}`, async () => {
    await (browser.initialized ? browser.fetch() : browser.init());
    return true;
  });
