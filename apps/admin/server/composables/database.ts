import { useBezoar } from "#bezoar/service";

/**
 * The admin's database: `@bbf/database`'s queries as functions, by group —
 * `admin.staff.list()`, `admin.events.update({ … })` — over the connection
 * the runtime config names, the same database the site reads.
 * `@bezoar/nuxt` opens it the first time it is asked for and closes it when
 * the server stops, so every call here is the one service, scoped to the
 * `admin` role: it offers the admin's reads and writes and the connection
 * runs them as `admin`. In development the server applies the migrations,
 * the grants and the seeds as it starts; in production the owner of the
 * database applies them before the app deploys.
 */
export const useDatabase = () => useBezoar();
