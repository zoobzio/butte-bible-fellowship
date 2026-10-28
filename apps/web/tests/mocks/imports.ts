import type { Root } from "hast";

import { reactive } from "vue";
import { vi } from "vitest";
import { CONTENT_URL } from "@prosary/nuxt/constant";

export * from "@bbf/nuxt/testing/imports";

export const useRuntimeConfig = () => ({
  public: { youtube: { channel: "UCtest" } },
});

const route = reactive({ path: "/" });

export const setRoutePath = (path: string) => {
  route.path = path;
};

export const useRoute = () => route;

const router = {
  back: vi.fn(),
  push: vi.fn(),
  options: { history: { state: { back: null as string | null } } },
};

export const setRouteBack = (path: string | null) => {
  router.options.history.state.back = path;
};

export const clearRouter = () => {
  router.back.mockClear();
  router.push.mockClear();
  setRouteBack(null);
};

export const useRouter = () => router;

const contentPages = new Map<string, Root>();

export const setContentPages = (pages: Record<string, Root>) => {
  contentPages.clear();
  for (const [path, page] of Object.entries(pages)) {
    contentPages.set(path, page);
  }
};

export const requestedDocuments: string[] = [];

export const clearContentPages = () => {
  contentPages.clear();
  requestedDocuments.length = 0;
};

const pathOf = (file: string) => {
  const page = file.replace(/^[^/]+\//, "").replace(/\.json$/, "");
  return page === "index" ? "/" : `/${page}`;
};

export const useRequestFetch = () => async (url: string) => {
  const file = url.slice(`${CONTENT_URL}/`.length);
  requestedDocuments.push(file);
  const page = contentPages.get(pathOf(file));
  if (!page) throw Object.assign(new Error(`404 ${url}`), { status: 404 });
  return page;
};
