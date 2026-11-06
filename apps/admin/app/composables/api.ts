import { tryUseNuxtApp, useLoadingIndicator, useRequestFetch } from "#imports";

export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // A record goes as JSON; a form, as an upload carries a file.
  body?: Record<string, unknown> | FormData;
  query?: Record<string, number | string>;
}

export type ApiFetch = (path: string, request?: ApiRequest) => Promise<unknown>;

/**
 * The shell's loading indicator, shared with the page loader, where a Nuxt
 * instance is reachable: on the client always, on the server within a
 * request. Table fetches are wired at module scope, where there is none, so
 * the indicator is resolved per call rather than as the API is built.
 */
const useIndicator = () =>
  tryUseNuxtApp() ? useLoadingIndicator() : undefined;

export const useApi =
  (): ApiFetch =>
  async (path, request = {}) => {
    // Get the fetch per call. Table fetches are wired at module scope.
    const fetch: unknown = useRequestFetch();
    // Every call starts the indicator and finishes it, red on failure, so
    // the bar runs across the top of the viewport for an API interaction as
    // it does for a page change.
    const indicator = useIndicator();
    indicator?.start();
    try {
      const result = await (fetch as ApiFetch)(path, request);
      indicator?.finish();
      return result;
    } catch (error) {
      indicator?.finish({ error: true });
      throw error;
    }
  };
