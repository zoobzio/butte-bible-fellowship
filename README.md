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

The pages are Markdown in [`@bbf/i18n`](packages/i18n), which builds
them for every locale. `apps/web/content.config.ts` gives each locale a Nuxt
Content collection over that build (`pages_en`, …), and `usePage` queries the
one for the active locale. After editing a page, rebuild the package
(`pnpm --filter @bbf/i18n build`) for the app to pick it up.

Nuxt Studio at `/admin` still expects the pages under `apps/web/content`, so
it cannot edit them until its patch is taught the package's layout.

Nuxt Studio 1.7.0 cannot serialize the hard break that Shift+Enter inserts and
writes `--- Unknown node: hardBreak ---` instead (upstream issue #265, fixed
after 1.7.0). Until that fix is released, `patches/nuxt-studio@1.7.0.patch`
works around it:

- Shift+Enter is saved as `:br`, and `:br` or backslash line breaks load back
  into the editor as line breaks.
- A paragraph hard-wrapped across several lines is joined onto one line when it
  is edited in Studio, instead of gaining a line break at every wrap.
- The Studio app is served from `/_studio-app/1.7.0-hardbreak.1/`. The bundle
  is cached as immutable, so browsers would otherwise keep the unpatched copy;
  bump that suffix whenever the patch changes.

When upgrading `nuxt-studio`, delete the patch file and its
`patchedDependencies` entry in `pnpm-workspace.yaml`, then run `pnpm install`.

## Language

The site's interface text lives in [`@bbf/i18n`](packages/i18n) as
[fibber](https://github.com/zoobzio/fibber) messages, not in components.
`@fibber/nuxt` provides `useT`; `app.config.ts` names the header's and
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

### Themes

The site's palette is a context of aurora's `theme` modifier — `bbf`, the
default — beside every aurora theme, all built into the app's theme. The
palette button in the footer opens a modal built from Foundation's `Dialog`:
on the left a `Command` searches the themes the build's manifest lists, and
on the right a `SegmentedControl` per remaining modifier — color scheme,
vibrancy, contrast, text size, density, corner radius, depth and motion.
Each choice is `useUntheme().swap(modifier, context)`; the untheme module
keeps the selection in its cookie and renders it on the server. There is no theme route and nothing to regenerate after upgrading
`@untheme/aurora`.

## Structure

```
app/
  app.vue           — root: NuxtLayout + NuxtPage
  layouts/default.vue
  components/       — site chrome (AppHeader, AppFooter)
  pages/            — routes
  assets/css/       — global styles on untheme tokens
nuxt.config.ts      — extends @zoobzio/foundation
```
