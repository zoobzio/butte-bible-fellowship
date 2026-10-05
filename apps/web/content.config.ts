import { fileURLToPath } from "node:url";

import { defineCollection, defineContentConfig, z } from "@nuxt/content";

import { locale as source, locales } from "@bbf/i18n";

/** A directory of `@bbf/i18n`, relative to its build. */
const directory = (path: string) =>
  fileURLToPath(new URL(path, import.meta.resolve("@bbf/i18n")));

/**
 * Where a locale's pages are read from. English is read as authored, from
 * the package's sources: an edit shows without a rebuild, and Nuxt Studio —
 * which writes a page back to the path its collection read it from — edits
 * the source file. Every other locale is read from the package's build,
 * where each carries every page: one a locale has not translated is the
 * English source.
 */
const pages = (locale: string) =>
  locale === source
    ? { cwd: directory("../src/content"), include: "**/*.md", prefix: "/" }
    : {
        cwd: directory("content"),
        include: `${locale}/**/*.md`,
        prefix: "/",
      };

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
 * paths: `/about-us` is the page in whichever collection is asked.
 */
export default defineContentConfig({
  collections: Object.fromEntries(
    locales.map((locale) => [
      `pages_${locale}`,
      defineCollection({ type: "page", source: pages(locale), schema }),
    ]),
  ),
});
