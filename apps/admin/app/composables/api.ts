import { useRequestFetch } from "#imports";

export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  query?: Record<string, number | string>;
}

export type ApiFetch = (path: string, request?: ApiRequest) => Promise<unknown>;

export const useApi =
  (): ApiFetch =>
  (path, request = {}) => {
    // Get the fetch per call. Table fetches are wired at module scope.
    const fetch: unknown = useRequestFetch();
    return (fetch as ApiFetch)(path, request);
  };
