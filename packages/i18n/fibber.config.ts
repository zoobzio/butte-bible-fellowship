import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { anthropic } from "@ai-sdk/anthropic";
import { defineConfig } from "@fibber/kit";

// The model's API key, for `fibber translate`: `.env` beside this file,
// never committed (`.env.example` lists what it holds). A variable already
// set wins over the file. Building needs no key.
const env = fileURLToPath(new URL(".env", import.meta.url));
if (existsSync(env)) {
  process.loadEnvFile(env);
}

/**
 * The site's words: the interface messages under `src/messages/` and the
 * pages under `src/content/`, both written in English. Each message file's
 * keys nest under its name — `home` in `navigation.json` is
 * `$t.navigation.home()`.
 *
 * English is the only language authored. Every locale listed under
 * `locales` is translated by the model, in a step of its own: `pnpm
 * translate` writes what a locale is missing, or has out of date, to
 * `.cache/`, which is committed — the cache that keeps a build offline and
 * the same every time. `fibber build` then turns the sources and `.cache/`
 * into the modules and documents in `.output/`, every locale's among them.
 */
export default defineConfig({
  source: "src/messages",
  locale: "en",
  locales: ["es", "fr"],
  content: "src/content",
  translations: ".cache",
  translate: {
    model: anthropic("claude-sonnet-5-5"),
  },
  outDir: ".output",
});
