# @bbf/nuxt

The Nuxt layer every app of the church extends: [`@zoobzio/nuxt`](https://github.com/zoobzio/foundation),
the design system's layer, with the church's icons, theme, fonts, stylesheet
and database service set up over it. An app extends it and names only what
is its own:

```ts
export default defineNuxtConfig({
  extends: ["@bbf/nuxt"],
  bezoar: { role: "web" },
});
```

## What it sets up

- `@nuxt/fonts`, with Newsreader and Work Sans.
- `@icon-sheets/nuxt`, over [`@bbf/icons`](../../packages/icons).
- `@untheme/nuxt`, over the [`@bbf/theme`](../../packages/theme) preset.
- `@bezoar/nuxt`, over the [`@bbf/database`](../../packages/database) build,
  on a Postgres in the process in development. The app names the role its
  connection runs as in `bezoar.role`.
- The stylesheet and public files of [`@bbf/assets`](../../packages/assets).
- Long-lived caching of `/_nuxt/**` and `/_fonts/**`, and the viewport meta.
- No auto-imports and no component scanning, as `@zoobzio/nuxt` has it.

## What it holds

The layer is named `bbf`, so an app's server reaches its code as
`#layers/bbf/server/…`:

```ts
import { useDatabase } from "#layers/bbf/server/composables/database";
import type { DatabaseRow } from "#layers/bbf/server/types/database";
```

The apps' tests share its support through the package, as `@bbf/nuxt/testing/…`:

| file                | what it is                                                           |
| ------------------- | -------------------------------------------------------------------- |
| `testing/bezoar.ts` | the vitest shim for `#bezoar/service`: a stub service a test fills   |
| `testing/mount.ts`  | `withSetup` and `mountSuspended`, to run a composable or async setup |

An app's `vitest.config.ts` aliases `#bezoar/service` to the shim and
`#layers/bbf` to the layer, as Nuxt would.

## Layout

```
nuxt.config.ts                  the layer
server/composables/database.ts  useDatabase: the bezoar service, as the app's role
server/types/database.ts        DatabaseQuery and DatabaseRow, from the service
testing/                        the test support the apps share
tests/                          the layer's own tests
```

The layer's files follow the same import graph as an app's, enforced by its
`.oxlintrc.json`.
