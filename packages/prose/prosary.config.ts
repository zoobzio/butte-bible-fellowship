import { anthropic } from "@ai-sdk/anthropic";
import { defineConfig } from "@prosary/kit";
import { gfm, matter, mdc } from "@prosary/parse/plugins";
import rehypeSlug from "rehype-slug";

/**
 * The site's words: the interface messages under `src/messages/` and the
 * pages under `src/content/`, both written in English. Each message file's
 * keys nest under its name — `home` in `navigation.json` is
 * `$t.navigation.home()`.
 *
 * English is the only language authored. Every locale listed under
 * `translate.targets` is translated by the model, in a step of its own:
 * `pnpm translate` writes what a locale is missing, or has out of date, to
 * `.cache/`, which is committed — the cache that keeps a build offline and
 * the same every time. `prosary build` then turns the sources and `.cache/`
 * into the modules and documents in `.output/`, every locale's among them.
 *
 * A page is built to the HTML tree the app renders. Its front matter goes
 * onto the root of the tree; the blocks the site sets in its pages —
 * `::invite-grid`, `:::invite-card`, `::map-embed{…}` — are MDC components,
 * as Nuxt Content read them, each rendered by the component of its name
 * under the app's `components/prose/`; and every heading gets an id, which
 * a page's table of contents links to.
 */
export default defineConfig({
  messages: "src/messages",
  content: {
    dir: "src/content",
    presets: [matter(), gfm(), mdc(), { rehype: [rehypeSlug] }],
  },
  translate: {
    source: "en",
    targets: ["es", "fr"],
    cache: ".cache",
    model: anthropic("claude-sonnet-5-5"),
  },
  outDir: ".output",
});
