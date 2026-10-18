import type { AppBezoarQuery, AppBezoarRow } from "#bezoar/service";

/** The name of a query of the database: `web.events.weekly`. */
export type DatabaseQuery = AppBezoarQuery;

/**
 * A row as a query of the database returns it, named by its columns: what a
 * util turns into the shape `@bbf/schema` says the API serves.
 */
export type DatabaseRow<Q extends DatabaseQuery> = AppBezoarRow<Q>;
