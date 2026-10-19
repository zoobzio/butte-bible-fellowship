import { useBezoar } from "#bezoar/service";

/**
 * The admin's database: `@bbf/database`'s queries as functions, by group —
 * `admin.staff.list()`, `admin.events.update({ … })` — over the connection
 * the runtime config names, the same database the site reads.
 * `@bezoar/nuxt` opens it the first time it is asked for and closes it when
 * the server stops, so every call here is the one service. The migrations
 * are applied as the server starts, before any endpoint runs.
 */
export const useDatabase = () => useBezoar();
