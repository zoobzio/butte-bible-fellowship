import type { ContentRecord, FolderRecord } from "@bbf/schema/types";

import type { BrowserFetch } from "~/types/content";

import { contentRecords, folderRecord, folderRecords } from "@bbf/schema";
import {
  accessBrowser,
  createBrowser,
  navigateTo,
  onMounted,
  useRequest,
  useRoute,
  watch,
} from "#imports";
import { useApi } from "~/composables/api";
import { FOLDERS, ROUTE, folder } from "~/composables/content/routes";
import { useContentRequests } from "~/composables/content/tasks";
import { CONTENT_BROWSER, browse, link } from "~/constants/content";
import { isNotFound } from "~/utils/errors";
import {
  folderId,
  folderOf,
  folderParam,
  toBrowserFolder,
  toContentQuery,
  toCrumb,
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
 * The folders from the top down to one, itself the last: the folder asked
 * of the admin's API, then each it is inside in turn. None when it, or one
 * above it, is no longer there.
 */
export const useFolderTrail = () => {
  const api = useApi();

  return async (id: number): Promise<FolderRecord[] | null> => {
    const trail: FolderRecord[] = [];
    try {
      for (let next: number | undefined = id; next !== undefined;) {
        const record = folderRecord.parse(await api(folder(next)));
        trail.unshift(record);
        next = record.parent;
      }
    } catch (caught) {
      if (isNotFound(caught)) return null;
      throw caught;
    }
    return trail;
  };
};

/**
 * Keeps the browser and the page's address to one folder, so a crumb's
 * link, which is that address, leads where it says. The address names the
 * open folder under `folder`, and none at the top.
 *
 * `land` is for the page's first listing: an address that names a folder
 * stands the browser in it before anything is fetched, its trail read from
 * the one the browser holds where the folder is on it, and asked of the
 * API where it is not. An address that names none leaves the browser where
 * it was left, and is put right to match once the page is up, as is one
 * whose folder is gone.
 *
 * From then on each follows the other: a folder opened, or a crumb picked,
 * moves the address, and the address moved, by the way back or forward,
 * moves the browser, through its own `navigate` and `open`, so the search
 * and the selection are dropped as they are on any move.
 */
export const useBrowserRoute = (
  browser: ReturnType<typeof useContentBrowser>,
) => {
  const route = useRoute();
  const trail = useFolderTrail();
  const state = accessBrowser<ContentRecord>(browser.id);

  const here = () => folderOf(browser.pathKeys);
  const asked = () => folderParam(route.query.folder);
  /* The address is the browser's to read only while it is the page's own. */
  const browsing = () => route.path === browse();

  /* Where a folder stands on the trail the browser holds: none off it. */
  const depthOf = (id: number) => browser.pathKeys.indexOf(String(id)) + 1;

  const land = async () => {
    const id = asked();
    if (id === undefined || id === here()) return;
    const depth = depthOf(id);
    if (depth > 0) {
      state.path = browser.path.slice(0, depth);
      return;
    }
    const folders = await trail(id);
    if (folders !== null) state.path = folders.map(toCrumb);
  };

  const follow = async (id: number | undefined) => {
    if (id === here()) return;
    const depth = id === undefined ? 0 : depthOf(id);
    if (id === undefined || depth > 0) {
      browser.navigate(depth);
      return;
    }
    const folders = await trail(id);
    const last = folders?.at(-1);
    if (folders === null || last === undefined) {
      await navigateTo(browse(here()), { replace: true });
      return;
    }
    /* Somewhere off the trail: stand above it, and open it from there. */
    state.path = folders.slice(0, -1).map(toCrumb);
    browser.open(toBrowserFolder(last));
  };

  watch(here, (open) => {
    if (browsing() && open !== asked()) navigateTo(browse(open));
  });

  watch(asked, (id) => {
    if (browsing()) follow(id);
  });

  onMounted(() => {
    if (browsing() && here() !== asked()) {
      navigateTo(browse(here()), { replace: true });
    }
  });

  return { land };
};

/**
 * Lists the open folder for the page the browser sits on. Every visit
 * fetches: the browser's state outlives the page, the folder that was open
 * with it, and what it held may have changed since. Its own `init` fetches
 * once only, and is what marks it as having listed anything at all, which
 * a folder's emptiness waits on: so the first visit goes through it. The
 * folder the page's address names is stood in first, so the one listing is
 * that folder's.
 */
export const useBrowserRequest = (
  browser: ReturnType<typeof useContentBrowser>,
) => {
  const { land } = useBrowserRoute(browser);
  return useRequest(`browser:${browser.id}`, async () => {
    await land();
    await (browser.initialized ? browser.fetch() : browser.init());
    return true;
  });
};
