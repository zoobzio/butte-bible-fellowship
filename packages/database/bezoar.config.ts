import { defineConfig } from "@bezoar/kit";

/**
 * The site's database, as SQL: the migrations under `src/migrations/`, the
 * seeds under `src/seeds/`, and one query per file under `src/queries/`.
 * `bezoar build` applies the migrations and seeds to a Postgres in memory,
 * describes every query, and writes the contract, the SQL, the migrations
 * and the seeds to `.output/`, which this package exports.
 */
export default defineConfig({
  outDir: ".output",
});
