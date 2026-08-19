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
