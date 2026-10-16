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

The pages are Markdown in [`@bbf/i18n`](packages/i18n), which builds every
one for every locale as the tree the app renders, its front matter on the
root. `@prosary/nuxt` serves them, and `usePage` fetches the one the route
names in the route's locale, checking its front matter against
[`@bbf/validators`](packages/validators). A page's body renders through the
module's `<Prose>`, with the components under `app/components/prose/` in
place of the elements and blocks they are named for: `A.vue` renders every
link as a NuxtLink in the reader's locale, `InviteCard.vue` every
`:::invite-card` block. The images the pages show are in
[`@bbf/assets`](packages/assets), served from the site's root.

Pages are edited in the repository, under `packages/i18n/src/content`. Run
`pnpm --filter @bbf/i18n translate` afterwards to bring the translations up
to date, or let CI do it on the pull request.

## Language

The site's interface text lives in [`@bbf/i18n`](packages/i18n) as
[prosary](https://github.com/zoobzio/prosary) messages, not in components.
`@prosary/nuxt` provides `$t` on the Nuxt app; `app.config.ts` names the
header's and footer's messages by key.

English is at the routes as written (`/about-us`); every other locale has the
same pages under its prefix (`/es/about-us`). The route decides the
language: a global middleware switches prosary to the locale the path names,
`usePage` fetches that locale's page, and `useRouteLocale` keeps links inside
it. The language button in the footer links to the page being read in each
language.

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
