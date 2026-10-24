import { useBezoar } from "#bezoar/service";

/**
 * The app's database: `@bbf/database`'s queries as functions, by group —
 * `web.events.weekly()`, `admin.staff.update({ … })` — over the connection
 * the runtime config names. `@bezoar/nuxt` opens it the first time it is
 * asked for and closes it when the server stops, so every call here is the
 * one service, scoped to the role the app names in `bezoar.role`: it offers
 * that role's queries and the connection runs them as that role. In
 * development the server applies the migrations, the grants and the seeds as
 * it starts; in production the owner of the database applies them before the
 * app deploys.
 */
export const useDatabase = () => useBezoar();
