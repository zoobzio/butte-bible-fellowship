import { useRequestFetch } from "#imports";

/** A request of the admin's own API: its method, what it carries, and what it asks. */
export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  query?: Record<string, number | string>;
}

/** A fetch of the admin's own API, by path: what it answers is checked where it is read. */
export type ApiFetch = (path: string, request?: ApiRequest) => Promise<unknown>;

/**
 * The admin's own API. The fetch is the request's, taken as each request
 * is made: during SSR it carries the browser's cookie to the API, so the
 * session that let the page render is the one its data is read under; in
 * the browser it is `$fetch` itself. A table's fetch is wired at module
 * scope and runs under the page's request, which is why the fetch is not
 * taken here, where no request is. Nuxt types `$fetch` by the server's
 * routes, and cannot match a path built as a request is made —
 * `/api/staff/${id}` — against them, so the one fetch is taken as a fetch
 * by path alone: a request is typed by what it carries, and what it
 * answers is checked against `@bbf/schema` where it is read.
 */
export const useApi =
  (): ApiFetch =>
  (path, request = {}) => {
    const fetch: unknown = useRequestFetch();
    return (fetch as ApiFetch)(path, request);
  };
