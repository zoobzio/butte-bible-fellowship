# @bbf/assets

The site's static assets: the files served as they are, such as the images
the pages show, and the design system's stylesheet.

## Layout

```
src/                   the assets, served from the site's root
src/images/            the images the pages show
src/css/               the design system's stylesheet
src/css/index.css      the entry: imports the rest, in order
src/css/base.css       site properties, reset, page shell, links
src/css/prose.css      the measure, headings, body copy, quotes, images, tables
src/css/components.css the call to action, toggle button and Foundation's parts
src/css/fonts.css      the font stacks, where @nuxt/fonts can see them
```

A file's path under `src/` is its URL: `src/images/tulips.jpg` is served at
`/images/tulips.jpg`, which is how a page refers to it.

Nothing is built. The web app serves `src/` as public assets from
`nuxt.config.ts`, and Nuxt Studio's media library reads and writes it.

## Styles

An app loads the stylesheet by its entry, which the bundler compiles into
the app's own CSS:

```ts
export default defineNuxtConfig({
  css: ["@bbf/assets/css/index.css"],
});
```

It styles what any page of the site shares: the semantic elements, the
classes Markdown content wears (`.prose`, `.prose-figure`,
`.prose-aside-image`, `.events-table`), the controls more than one component
uses (`.cta`, `.theme-toggle`) and Foundation's unstyled parts (menu, dialog,
listbox, toggle group). Every value is a `@bbf/theme` variable, but for
`--font-display`, which `base.css` declares.

What only one page or component wears is not here: it is in a `<style>`
block of that component, in the app.
