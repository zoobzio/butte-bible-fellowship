import { useBezoar } from "#bezoar/service";

/**
 * The site's database: `@bbf/database`'s queries as functions, by group —
 * `web.events.weekly()`, `web.sermons.latest({ limit })` — over the
 * connection the runtime config names. `@bezoar/nuxt` opens it the first
 * time it is asked for and closes it when the server stops, so every call
 * here is the one service. The migrations are applied as the server starts,
 * before any endpoint runs.
 */
export const useDatabase = () => useBezoar();
