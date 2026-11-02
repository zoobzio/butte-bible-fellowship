import { fuzzystrmatch } from "@electric-sql/pglite/contrib/fuzzystrmatch";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { defineConfig } from "@bezoar/kit";

export default defineConfig({
  outDir: ".output",
  database: { extensions: { fuzzystrmatch, pg_trgm } },
});
