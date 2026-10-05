import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineCollection, defineContentConfig, z } from "@nuxt/content";

import { locales } from "@bbf/i18n";

/**
 * The pages `@bbf/i18n` built, as Markdown: `content/<locale>/<page>`
 * beside the package's entry, every locale carrying every page — one a locale
 * has not translated is the English source.
 */
const cwd = join(
  dirname(fileURLToPath(import.meta.resolve("@bbf/i18n"))),
  "content",
);

const schema = z.object({
  hero: z
    .object({
      tagline: z.string(),
      highlight: z.string().optional(),
      description: z.string().optional(),
      cta: z
        .object({
          label: z.string(),
          to: z.string(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * A collection per locale, named `pages_<locale>`, each holding the same
 * paths: the locale's directory is dropped, so `/about-us` is the page in
 * whichever collection is asked.
 */
export default defineContentConfig({
  collections: Object.fromEntries(
    locales.map((locale) => [
      `pages_${locale}`,
      defineCollection({
        type: "page",
        source: { cwd, include: `${locale}/**/*.md`, prefix: "/" },
        schema,
      }),
    ]),
  ),
});
