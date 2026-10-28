# Butte Bible Fellowship

Website for Butte Bible Fellowship, built with [Nuxt 4](https://nuxt.com) on top
of the [`@zoobzio/foundation`](https://github.com/zoobzio/foundation) design
system layer.

## Setup

```sh
pnpm install
pnpm dev          # start the dev server at http://localhost:3000
```

## Local environment

`pnpm dev` runs each app over a Postgres of its own, in the process, so a
change the admin app makes never reaches the site. To see them together,
run both over one database in Docker:

```sh
make dev          # Postgres, the site at :3000 and the admin at :3001, detached
make logs         # follow their output; `make up` runs them in the foreground
make psql         # a shell on the database
make down         # stop; `make reset` also drops the database
```

[`compose.yaml`](compose.yaml) bind-mounts the checkout into each app's
container, so the dev servers hot-reload the files you edit as they would
on the host, and both connect to the one Postgres through the `pg` driver,
each applying the migrations, the roles and the seeds as it starts. The
database is also on `localhost:5432`, so `pnpm dev` on the host can use it
instead with the same two variables:

```sh
NUXT_BEZOAR_DRIVER=pg NUXT_BEZOAR_URL=postgres://postgres:postgres@localhost:5432/bbf pnpm dev
```

The containers use the host's `node_modules`, so `pnpm install` runs on the
host (`make dev` and `make up` run it), and a change to a package is built as it is on the
host, by the package's `prepare` script.

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Start the Nuxt dev server     |
| `pnpm build`     | Build for production          |
| `pnpm generate`  | Prerender a static site       |
| `pnpm preview`   | Preview the production build  |
| `pnpm typecheck` | Type-check (`nuxi typecheck`) |

## Content

The pages are Markdown in [`@bbf/prose`](packages/prose), which builds every
one for every locale as the tree the app renders, its front matter on the
root. `@prosary/nuxt` serves them, and `usePage` fetches the one the route
names in the route's locale, checking its front matter against
[`@bbf/schema`](packages/schema). A page's body renders through the
module's `<Prose>`, with the components under `app/components/prose/` in
place of the elements and blocks they are named for: `A.vue` renders every
link as a NuxtLink in the reader's locale, `InviteCard.vue` every
`:::invite-card` block. The images the pages show are in
[`@bbf/assets`](packages/assets), served from the site's root.

Pages are edited in the repository, under `packages/prose/src/content`. Run
`pnpm --filter @bbf/prose translate` afterwards to bring the translations up
to date, or let CI do it on the pull request.

## Language

The church's interface text lives in [`@bbf/prose`](packages/prose) as
[prosary](https://github.com/zoobzio/prosary) messages, not in components:
the site's at the top level, the admin's under `admin/`. The `@bbf/nuxt`
layer provides `$t` on the Nuxt app of both; each app's `app.config.ts`
names its navigation's messages by key.

The language is the visitor's own, not the route's: the prosary module picks
it from their cookie, else from the languages their browser asks for, and
renders the page in it. The layer's `LanguagePicker` — in the site's footer
and the admin's account panel — switches it in place and keeps the choice in
the cookie. The site's old `/es/…` addresses redirect to the page itself.

English is the only language authored. CI translates what the other locales
are missing on every pull request and commits the result; see the package.

## Architecture

Both apps extend [`@bbf/nuxt`](integrations/nuxt), the church's layer over
the `@zoobzio/nuxt` design system layer, from `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  extends: ["@bbf/nuxt"],
  bezoar: { role: "web" },
});
```

The layer sets up the icons, theme, fonts, stylesheet, words and database
service every app shares, and holds the language and appearance controls,
the server code and the test support they share;
see [`integrations/`](integrations). The design system disables
auto-imports, so everything is imported explicitly — its modules come in
through the package's subpath exports:

```ts
import { createTable } from "@zoobzio/nuxt/factories/table";
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
  types/            — the shapes the app speaks in
  constants/
  utils/            — pure functions
  composables/      — reactivity and the Nuxt instance, for the components
  components/       — template and style; the logic in a composable
  pages/            — routes
  layouts/, middleware/, plugins/
server/
  types/            — the shapes the server speaks in
  constants/
  utils/            — pure, single-purpose functions of this app alone; the shared ones are @bbf/utils
  composables/      — the services an endpoint needs, over the request and the Nitro runtime
  api/              — endpoints: each names a composable and runs it
nuxt.config.ts      — extends @bbf/nuxt
```

### Layers

Both sides of the app are the same directed graph, and `apps/web/.oxlintrc.json`
enforces it with `no-restricted-imports`, one override per layer. A file
imports by alias — `~/<layer>/…` in the app, `~~/server/<layer>/…` on the
server — so the layer is in the specifier, and a file may only import the
layers above its own:

| layer       | may import                                 | may not                                           |
| ----------- | ------------------------------------------ | ------------------------------------------------- |
| types       | types, external packages (`import type`)   | anything with a runtime                           |
| constants   | types, constants, external packages        | utils and below; the Nitro or Vue runtime         |
| utils       | types, constants, utils, external packages | the runtime; the request; the database            |
| composables | all of the above, and composables          | components or endpoints                           |
| the bottom  | composables, constants, types              | utils (put the logic in a composable); each other |

In the app the bottom is `components`, `pages`, `layouts`, `middleware` and
`plugins`; on the server it is `api`, `routes`, `middleware` and `plugins`.
The app layer is out of the server's reach — no `~/`, `#imports` or `vue` —
and the server imports `h3` and `nitropack/runtime` by name.

### Server

An endpoint is an executor: it names the composable that does the work and
the policy it runs under — caching, say — and nothing else, so what it does
can be read in a line. A composable is a function of the request's
`H3Event` that gathers what the endpoint needs — the runtime config, the
database, another service — and hands back the operations to run. A util is
a pure function. The ones every app shares — a row of
[`@bbf/database`](packages/database) into the shape
[`@bbf/schema`](packages/schema) says the API serves, and an input back into
a query's arguments — are in [`@bbf/utils`](packages/utils), and a
composable runs them over what the database returns. The database is a
service: only a composable builds it, and only a composable hands a
connection on.

```ts
// server/composables/sermons.ts
export const useSermons = () => {
  const db = useDatabase();
  const list = (limit: number) =>
    db.web.sermons.list({ limit }).then((rows) => rows.map(toSermon));
  return { list };
};

// server/api/sermons/index.get.ts
export default defineEventHandler((event) => {
  const { limit } = sermonsQuery.parse(getQuery(event));
  return useSermons().list(limit);
});
```
