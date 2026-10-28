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

The layer is named `bbf`, so an app reaches its code as `#layers/bbf/…`,
the app side under `app/` and the server side under `server/`. Nothing is
scanned or auto-imported: an app names what it uses, as it does the design
system's.

```ts
import ColorMode from "#layers/bbf/app/components/ColorMode.vue";
import { useThemes } from "#layers/bbf/app/composables/themes";
import { useDatabase } from "#layers/bbf/server/composables/database";
import type { DatabaseRow } from "#layers/bbf/server/types/database";
```

The layer's own files reach one another the same way, by `#layers/bbf/…`:
inside a layer, `~/` resolves against the app that extends it.

### Appearance

The controls over the church's theme, which every app offers:

| component           | what it is                                                        |
| ------------------- | ----------------------------------------------------------------- |
| `ColorMode.vue`     | a button that switches the color scheme                           |
| `ThemePicker.vue`   | a button that opens a searchable list of the build's themes       |
| `ThemeSettings.vue` | a button that opens a button group per modifier (contrast, text…) |

Each names itself in English unless the app names it: `ColorMode` takes
`labels` by the scheme a press switches to, `ThemePicker` takes `labels` for
its button, list and search field, and `ThemeSettings` takes `label` for its
button and panel. The web names them in the reader's language from its
messages; the admin takes the defaults.

The composables under them — `useColorMode`, `useThemes`, `useModifiers` —
are the untheme service as the controls read it: each selection held
app-wide, persisted in a cookie so SSR renders it, and changed through a
view-transition cross-fade where the browser has one.

### Testing

The apps' tests share its support through the package, as `@bbf/nuxt/testing/…`:

| file                    | what it is                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `testing/imports.ts`    | the vitest shim for `#imports` every app shares: Vue, `useState`, `useUntheme`, …  |
| `testing/components.ts` | the vitest shim for `#components` every app shares: `NuxtLink`, `Icon`, `Popover`… |
| `testing/bezoar.ts`     | the vitest shim for `#bezoar/service`: a stub service a test fills                 |
| `testing/mount.ts`      | `withSetup` and `mountSuspended`, to run a composable or async setup               |

An app's `tests/mocks/imports.ts` and `tests/mocks/components.ts` re-export
the shared shims and add what the app's own modules put there (the web's
`$t`, the admin's `useAuth`, …). An app's `vitest.config.ts` aliases the
virtual modules to its mocks, `#bezoar/service` to the shim and `#layers/bbf`
to the layer, as Nuxt would.

## Layout

```
nuxt.config.ts                  the layer
app/components/                 ColorMode, ThemePicker and ThemeSettings
app/composables/                useColorMode, useThemes and useModifiers
app/types/theme.ts              the themes, settings and labels, as types
app/utils/theme.ts              transition: a change as a view-transition cross-fade
server/composables/database.ts  useDatabase: the bezoar service, as the app's role
server/types/database.ts        DatabaseQuery and DatabaseRow, from the service
testing/                        the test support the apps share
tests/                          the layer's own tests
```

The layer's files follow the same import graph as an app's, enforced by its
`.oxlintrc.json`.
