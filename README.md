# Butte Bible Fellowship

Website for Butte Bible Fellowship, built with [Nuxt 4](https://nuxt.com) on top
of the [`@zoobzio/foundation`](https://github.com/zoobzio/foundation) design
system layer.

## Setup

```sh
pnpm install
pnpm dev          # start the dev server at http://localhost:3000
```

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the Nuxt dev server     |
| `pnpm build`     | Build for production          |
| `pnpm generate`  | Prerender a static site       |
| `pnpm preview`   | Preview the production build  |
| `pnpm typecheck` | Type-check (`nuxi typecheck`) |

## Content

The pages are Markdown in [`@bbf/i18n`](packages/i18n), which builds them for
every locale. `apps/web/content.config.ts` gives each locale a Nuxt Content
collection (`pages_en`, …) and `usePage` queries the one the route names.
English is read from the package's sources, so an edit shows at once; the
translations are read from its build. The images the pages show are in
[`@bbf/assets`](packages/assets), served from the site's root.

### Nuxt Studio

English pages and the media are edited through Nuxt Studio at `/admin`. Studio
expects both inside the app, at `content/` and `public/`, so
`patches/nuxt-studio@1.7.0.patch` adds three options, set in `nuxt.config.ts`:

- `repository.paths` — where each of those two folders is in the repository:
  the pages in `packages/i18n/src/content`, the media in
  `packages/assets/src`. This is where Studio commits.
- `source` — the same two directories on disk, for Studio run locally.
- `collections.exclude` — the collections Studio leaves out: every
  translation, since those are generated from the English.

An edit made in Studio changes the English only. Run
`pnpm --filter @bbf/i18n translate` afterwards to bring the translations up to
date.

The patch also works around Studio 1.7.0 being unable to serialize the hard
break that Shift+Enter inserts — it writes `--- Unknown node: hardBreak ---`
instead (upstream issue #265, fixed after 1.7.0):

- Shift+Enter is saved as `:br`, and `:br` or backslash line breaks load back
  into the editor as line breaks.
- A paragraph hard-wrapped across several lines is joined onto one line when it
  is edited in Studio, instead of gaining a line break at every wrap.

The Studio app is served from `/_studio-app/1.7.0-bbf.1/`. The bundle is
cached as immutable, so browsers would otherwise keep an older copy; bump that
suffix (`version` in the patched `module.mjs`) whenever the patch changes the
app bundle.

When upgrading `nuxt-studio`, the hard-break part of the patch can go once
the upstream fix is released; the three options have to be carried over.

## Language

The site's interface text lives in [`@bbf/i18n`](packages/i18n) as
[fibber](https://github.com/zoobzio/fibber) messages, not in components.
`@fibber/nuxt` provides `$t` on the Nuxt app; `app.config.ts` names the header's and
footer's messages by key.

English is at the routes as written (`/about-us`); every other locale has the
same pages under its prefix (`/es/about-us`), all prerendered. The route
decides the language: a global middleware switches fibber to the locale the
path names, `usePage` reads that locale's collection, and `useRouteLocale`
keeps links inside it. The language button in the footer links to the page
being read in each language.

## Architecture

The app extends the Foundation layer from `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: ["@zoobzio/foundation"],
});
```

Foundation disables auto-imports, so everything is imported explicitly —
Foundation modules come in through the package's subpath exports:

```ts
import Button from "@zoobzio/foundation/components/common/button.vue";
import { useTable } from "@zoobzio/foundation/factories/table";
```

Styling uses the aurora untheme tokens (`--surface`, `--space-*`, `--type-*`, …).
[`@bbf/theme`](packages/theme) builds the aurora preset, with the site's own tonal ramps, using
[untheme](https://github.com/zoobzio/untheme), and `@untheme/nuxt` renders it
into the app and mirrors the color scheme onto `<html>` as `data-color`.

### Styles

The design system's stylesheet is in [`@bbf/assets`](packages/assets), loaded
from `nuxt.config.ts` as `@bbf/assets/css/index.css`: the semantic elements,
the classes Markdown content wears, the shared controls and Foundation's
unstyled parts. What only one page or component wears is in a `<style>` block
of that component. The blocks are not scoped — Markdown is slotted in and
Foundation's popovers and menus portal to `<body>` — so a class is named for
its component (`site-footer-*`, `theme-picker-*`).

### Themes

The site's palette is a context of aurora's `theme` modifier — `bbf`, the
default — beside every aurora theme, all built into the app's theme. The
palette button in the footer opens a Foundation `Popover` whose `Command`
searches the themes the build's manifest lists, and the sliders button
beside it opens another with a `SegmentedControl` per remaining modifier —
color scheme, vibrancy, contrast, text size, density, corner radius, depth
and motion. The two are separate controls over the one untheme service.
Each choice is `useUntheme().swap(modifier, context)`; the untheme module
keeps the selection in its cookie and renders it on the server. There is no theme route and nothing to regenerate after upgrading
`@untheme/aurora`.

## Structure

```
app/
  app.vue           — root: NuxtLayout + NuxtPage
  layouts/default.vue
  components/       — site chrome (AppHeader, AppFooter), each with its styles
  pages/            — routes
nuxt.config.ts      — extends @zoobzio/foundation
```
