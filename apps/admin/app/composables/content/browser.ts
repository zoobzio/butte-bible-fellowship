import type { ContentRecord, ContentResource } from "@bbf/schema/types";

import type { BrowserFetch } from "~/types/content";

import { contentResource } from "@bbf/schema";
import {
  accessBrowser,
  createBrowser,
  navigateTo,
  useRequest,
  useRoute,
} from "#imports";
import { useApi } from "~/composables/api";
import { endpoint } from "~/composables/content/routes";
import { useContentRequests } from "~/composables/content/tasks";
import { CONTENT_BROWSER, browse } from "~/constants/content";
import { isNotFound } from "~/utils/errors";
import {
  samePath,
  toContentQuery,
  toCrumbs,
  toListing,
  toPath,
} from "~/utils/folders";

/**
 * What the open folder holds, over the admin's API: the folders inside it
 * and the documents filed in it, asked for in one request, of the folder's
 * own path.
 */
export const useFolderFetch = (): BrowserFetch<ContentRecord> => {
  const api = useApi();

  return async ({ path, ...search }) => {
    const resource = contentResource.parse(
      await api(endpoint(path), { query: toContentQuery(search) }),
    );
    return toListing(resource, path);
  };
};

/**
 * The content browser: the config of the constants over the admin's API. A
 * document's edit is the way to its page, under the folder that is open.
 * Its move, and a folder's rename, move and delete, are left as requests
 * for the content page to carry out, each of a move with the path of what
 * was picked up. The rows select,
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
        navigateTo(browse([...useContentBrowser().pathKeys, record.slug]));
      },
    },
    move: {
      label: "admin.content.move",
      action: (record) => {
        useContentRequests().value.held = {
          kind: "document",
          path: [...useContentBrowser().pathKeys, record.slug],
          name: record.title,
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
          path: [...useContentBrowser().pathKeys, asked.key],
          name: asked.label,
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
 * The path the page's address names, under the content's own page: the
 * folder it browses, or the document it edits. None at the top.
 */
export const useContentPath = (): string[] => toPath(useRoute().params.path);

/**
 * What the page's address names, asked of the admin's API in one request:
 * a folder with what it holds, a document, or nothing where the path names
 * neither. The address is all that is read to ask: its path is the
 * request's, and the trail over a folder is that path's own names, so
 * nothing is waited on before the request is made.
 *
 * A folder is put in the browser as it comes back: the browser stands in
 * it, on the trail its path spells, and lists what it holds. Arrived at
 * from another folder, it is asked for with nothing searched for, and the
 * search is dropped with the selection, as they are on any move; come back
 * to, it is asked for as the browser was left, its sort and its search
 * kept. Every visit asks: what a folder holds may have changed since. A
 * document leaves the browser where it stands.
 */
export const useContentRequest = (
  browser: ReturnType<typeof useContentBrowser>,
  path: readonly string[],
) => {
  const api = useApi();
  const state = accessBrowser<ContentRecord>(browser.id);

  return useRequest(
    `content:${browse(path)}`,
    async (): Promise<ContentResource | null> => {
      const moved = !samePath(browser.pathKeys, path);
      const query = toContentQuery({
        sortField: browser.sortField,
        sortDirection: browser.sortDirection,
        query: moved ? "" : browser.query.text,
        filters: moved ? [] : browser.query.filters,
      });
      let resource: ContentResource;
      try {
        resource = contentResource.parse(await api(endpoint(path), { query }));
      } catch (caught) {
        if (isNotFound(caught)) return null;
        throw caught;
      }
      if (resource.kind === "folder") {
        const { folders, files } = toListing(resource, path);
        if (moved) {
          state.path = toCrumbs(path);
          state.clauses = [];
          state.draft = "";
        }
        state.selected = new Set();
        state.selectedFolders = new Set();
        state.folders = folders;
        state.files = files;
        state.initialized = true;
      }
      return resource;
    },
  );
};
