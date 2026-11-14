# @bbf/nuxt

The Nuxt layer every app of the church extends: [`@zoobzio/nuxt`](https://github.com/zoobzio/foundation),
the design system's layer, with the church's icons, theme, fonts, stylesheet,
words and database service set up over it. An app extends it and names only
what is its own:

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
- `@prosary/nuxt`, over the [`@bbf/prose`](../../packages/prose) build: `$t`
  on every app, in the reader's language, which the module picks from their
  cookie, else their browser's languages. The web's pages are served along
  with the messages; the admin leaves them unread.
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

### The header

The bar along the top of every app: the brand, which leads home, then the
app's links, and at the far end the language and appearance controls, with
whatever the app adds after them in the default slot. An app configures it
in its `app.config.ts`, under `header`, as a `HeaderConfig`: the message
that names the line under the church's name, and its links, each a message
key and a path. The layer's own `app.config.ts` holds the default the app's
merges over: the site's tagline, and no links.

```ts
const header: HeaderConfig = {
  tagline: "admin.site.tag",
  links: [{ label: "admin.navigation.staff", to: "/staff" }],
};
```

```vue
<AppHeader>
  <AccountMenu />
</AppHeader>
```

| component          | what it is                                                         |
| ------------------ | ------------------------------------------------------------------ |
| `AppHeader.vue`    | the bar: brand, links, controls, the app's slot, the mobile menu   |
| `AppMobileNav.vue` | the links as a menu behind one button, in place of them on a phone |

`useNavigation`, under both, is the config in the reader's words: the way
home, the tagline, and each link, marked while its page or a page under it
is read (`isWithin`). `useHeaderHeight` publishes the bar's height to the
root as `--header-height`, which what sticks under it reads.

### Language and appearance

The controls over the reader's language and the church's theme, which the
header offers in every app, each named in the reader's language from
`appearance.json` and `language.json` of `@bbf/prose`:

| component            | what it is                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `LanguagePicker.vue` | a button that opens a searchable list of the languages, by name   |
| `ColorMode.vue`      | a button that switches the color scheme                           |
| `ThemePicker.vue`    | a button that opens a searchable list of the build's themes       |
| `ThemeSettings.vue`  | a button that opens a button group per modifier (contrast, text…) |

`useLanguages`, under the language picker, is the prosary module's locale
as the picker reads it: the name of the language being read, every language
by its own name — `Español`, from `languageName` — and `choose`, which
switches the app in place. The module holds the choice in a cookie, so the
next visit is read in it too. What a component resolves with `$t` follows
the switch on its own; what an app resolves once, as it sets a page up,
does not, and the admin keys its page by the locale for that.

The composables under the appearance controls — `useColorMode`, `useThemes`,
`useModifiers` — are the untheme service as the controls read it: each
selection held app-wide, persisted in a cookie so SSR renders it, and
changed through a view-transition cross-fade where the browser has one.

### The table of contents

A page's headings as a list of links beside it, the ones whose sections are
on screen marked: the web's About Us lists the page it serves, the admin
the page being written.

| file                             | what it is                                                                |
| -------------------------------- | ------------------------------------------------------------------------- |
| `components/TableOfContents.vue` | the list, of the `OutlineEntry`s it is handed: nothing for none           |
| `composables/outline.ts`         | `useOutline`, a tree's outline; `useOutlineSpy`, the entries on screen    |
| `composables/motion.ts`          | `useFrame`: a callback run once a frame however often it is scheduled     |
| `utils/outline.ts`               | `outline`, a tree's own headings with an id; `sectionsOnScreen`, the math |

Each entry links to its heading by id, so whoever hands the entries over
sees that the headings on the page carry them.

### Testing

The apps' tests share its support through the package, as `@bbf/nuxt/testing/…`:

| file                    | what it is                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `testing/imports.ts`    | the vitest shim for `#imports` every app shares: Vue, `useState`, `useUntheme`, `useLocale`, `useRoute`, `$t`… |
| `testing/components.ts` | the vitest shim for `#components` every app shares: `NuxtLink`, `Icon`, `Popover`, `Menu`…                     |
| `testing/bezoar.ts`     | the vitest shim for `#bezoar/service`: a stub service a test fills                                             |
| `testing/mount.ts`      | `withSetup` and `mountSuspended`, to run a composable or async setup                                           |
| `testing/page.ts`       | `stubPage`: the window's scroll, size and frames, for a test to move                                           |

An app's `tests/mocks/imports.ts` and `tests/mocks/components.ts` re-export
the shared shims and add what the app's own modules put there (the web's
`useRequestFetch`, the admin's `useAuth`, …). The shared `useNuxtApp` is
`$t` over the real build of `@bbf/prose`, and `setLocale` switches it, as
`setRoutePath` moves the shared `useRoute`; an app whose modules put more on
the Nuxt app spreads it into its own. An app's `vitest.config.ts` aliases the
virtual modules to its mocks, `#bezoar/service` to the shim and `#layers/bbf`
to the layer, as Nuxt would.

## Layout

```
nuxt.config.ts                  the layer
app/app.config.ts               the header's default, which an app's config merges over
app/components/                 AppHeader and AppMobileNav; LanguagePicker, ColorMode, ThemePicker and ThemeSettings
app/composables/                useNavigation and useHeaderHeight; useLanguages, useColorMode, useThemes and useModifiers
app/types/navigation.ts         HeaderConfig and its links, as an app configures them and as they render
app/types/theme.ts              the themes and settings, as types
app/utils/locale.ts             languageName: a language's name in that language
app/utils/navigation.ts         isWithin: whether a path is a section's page or under it
app/utils/theme.ts              transition: a change as a view-transition cross-fade
server/composables/database.ts  useDatabase: the bezoar service, as the app's role
server/types/database.ts        DatabaseQuery and DatabaseRow, from the service
testing/                        the test support the apps share
tests/                          the layer's own tests
```

The layer's files follow the same import graph as an app's, enforced by its
`.oxlintrc.json`.
