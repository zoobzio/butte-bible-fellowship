# @bbf/assets

The site's static assets: the files served as they are, such as the images
the pages show, and the design system's stylesheet.

## Layout

```
src/                   the assets, served from the site's root
src/favicon.ico        the mark, white on the brand blue, at 16 to 64px
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

The favicon is `@bbf/icons`' `src/logo.svg` — the mark, drawn in
`currentColor` — in the palette's `primary-500` (`#367eff`) over a white
disc, so the cross and book read white rather than showing the tab behind
them. To redo it, copy the SVG, add
`<circle cx="705" cy="708" r="606" fill="#fff"/>` before its `<path>`, then:

```sh
for n in 16 32 48 64; do
  rsvg-convert -w $n -h $n --stylesheet <(echo 'svg{color:#367eff}') \
    mark.svg -o $n.png
done
magick 16.png 32.png 48.png 64.png src/favicon.ico
```

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
uses (`.cta`, `.theme-toggle`) and Foundation's unstyled parts (menu, popover,
listbox, toggle group). Every value is a `@bbf/theme` variable, read
through the roles each modifier axis rebinds, but for the site properties
`base.css` declares: the display face, the site's measure, and the few
things aurora has no token for — the rule (`--rule`), the signature stripe
(`--gradient-signature`), the arch (`--arch`) and the hover lift
(`--lift`) — each bound per axis context there so that every setting the
footer offers shows.

What only one page or component wears is not here: it is in a `<style>`
block of that component, in the app.
