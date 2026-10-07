# @bbf/i18n

The site's words: its interface messages and its pages, built by
[`@fibber/kit`](https://github.com/zoobzio/fibber/tree/main/packages/kit)
into a typed contract, a bundle of compiled messages per locale, and the
Markdown documents — what the
[fibber](https://github.com/zoobzio/fibber) runtime (`fibber-lang`) consumes.

## Layout

```
fibber.config.ts   the kit config: the locales, the sources, the model
src/messages/      the interface messages, in English, one file per group
src/content/       the pages, in English, as Markdown
.cache/            the translation cache: each locale's translations (committed)
.env               the model's API key, for `pnpm translate` (yours, not committed)
.output/           the kit's output, every locale's (generated, not committed)
```

Each message file is a FormatJS message-descriptor document, and its keys
nest under its name: `home` in `navigation.json` is the message
`navigation.home`, called as `$t.navigation.home()`. The `description` beside
each message is the note a translator reads.

| File              | Messages                                                 |
| ----------------- | -------------------------------------------------------- |
| `site.json`       | the church's name, its tagline and the meta description  |
| `navigation.json` | the primary navigation: its links and accessible names   |
| `footer.json`     | the footer's headings, service time and copyright line   |
| `appearance.json` | the color scheme toggle, theme picker and theme settings |
| `language.json`   | the language switcher                                    |
| `page.json`       | page-level words: not found, contents, the way back      |
| `about.json`      | the about page: its title                                |
| `sermons.json`    | the sermons page: its header, play button, channel link  |
| `events.json`     | the events pages, an event’s days, the home page’s week  |
| `connect.json`    | the connect page: its header                             |

Messages are ICU MessageFormat, where an ASCII apostrophe is the escape
character — write a typographic one (`You’re`), as the pages already do.

## Locales

English is the only locale, and the only language authored. Every other
locale is translated by a model, in a step of its own — never the build. CI
runs it (`.github/workflows/translate.yml`) on every pull request and every
push to `main`, and commits what changed back to the branch; a developer can
run it too:

1. `pnpm translate` writes what each locale is missing, or has out of date,
   to `.cache/<locale>/`, mirroring the sources file for file. The lock beside
   them (`.cache/.fibber.lock.json`) records what each translation was made
   from, so a run only translates what changed since the last.
2. `.cache/` is committed — by CI, or by you with the change to the sources.
   It is the cache that keeps every build offline and the same: nothing is
   translated twice, and no build calls a model.
3. `pnpm build` compiles the sources and `.cache/` into `.output/`, every
   locale's messages and pages among them. A message or page a locale has no
   translation of is built from the English source.

To add a locale, list it under `locales` in `fibber.config.ts` and run
`pnpm translate`. That needs `ANTHROPIC_API_KEY`: copy `.env.example` to
`.env` and fill it in (CI reads the repository secret of the same name). The
model is `translate.model` in the config — any AI
SDK provider's. `pnpm translate:check` lists what a run would translate
without calling the model, and exits 1 when there is anything.

Leave the files under `.cache/` as the model wrote them. The lock tells a
translation it wrote from one edited by hand, and keeps a hand-edited one
even when its source changes.

## Exports

- `@bbf/i18n`: the `contract` a fibber service is made from, the
  `locale`, `locales`, `messages` and `documents` lists, the `isLocale` /
  `isKey` guards, and the `Locale`, `Key`, `Document` and `Arguments`
  types. Carries no message text.
- `@bbf/i18n/bundles`: a lazy loader per locale, each resolving to that
  locale's compiled messages.
- `@bbf/i18n/content/<locale>/<page>.md`: each locale's pages.

```ts
import { makeFibber } from "fibber-lang";
import { contract, locale } from "@bbf/i18n";
import { bundles } from "@bbf/i18n/bundles";

const fibber = makeFibber(contract, {
  locale,
  messages: await bundles[locale](),
});
fibber.format("navigation.home"); // "Home"
```

## In the app

The web app hands the build to `@fibber/nuxt` in `nuxt.config.ts` —
`fibber: { build: "@bbf/i18n" }` — which provides `$t` on the Nuxt app. A component
calls a message it names (`$t.navigation.open()`); data carries one by key,
typed as `AppFibberMessage`, and resolves it where it renders
(`$t(link.label)`). The header and footer in `app.config.ts` are data of that
kind. Nuxt reads the built output when it loads its config, so restart
`pnpm dev` after rebuilding this package.

The locale is in the route: English at `/about-us`, Spanish at
`/es/about-us`. The app adds each target locale's routes from this package's
`locales`, so listing a new one here is all it takes.

The pages reach the app through Nuxt Content: `content.config.ts` defines a
collection per locale over `.output/content/<locale>/`, and the app's
`usePage` queries the active locale's. Front matter and MDC components work
as in any Nuxt Content page.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm translate`: brings `.cache/` up to date with the sources. CI runs it
  on pull requests and pushes to `main`.
- `pnpm translate:check`: reports what `pnpm translate` would do.
- `pnpm test`: rebuilds, then checks the contract, the bundle and the pages
  against their sources.
