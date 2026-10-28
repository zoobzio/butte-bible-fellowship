import type { AppBezoarQuery, AppBezoarRow } from "#bezoar/service";

export type DatabaseQuery = AppBezoarQuery;

export type DatabaseRow<Q extends DatabaseQuery> = AppBezoarRow<Q>;
