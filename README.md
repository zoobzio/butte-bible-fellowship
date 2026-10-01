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

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Start the Nuxt dev server       |
| `pnpm build`     | Build for production            |
| `pnpm generate`  | Prerender a static site         |
| `pnpm preview`   | Preview the production build    |
| `pnpm typecheck` | Type-check (`nuxi typecheck`)   |

## Content

Markdown lives in `content/` and is edited through Nuxt Studio at `/admin`.

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

Styling uses the aurora untheme tokens (`--surface`, `--space-*`, `--type-*`, …)
provided by the layer.

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
