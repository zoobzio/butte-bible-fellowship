# @bbf/prose

The site's words: its interface messages and its pages, built by
[`@prosary/kit`](https://github.com/zoobzio/prosary/tree/main/packages/kit)
into a typed contract, a bundle of compiled messages per locale, and each
page as the tree the app renders — what the
[prosary](https://github.com/zoobzio/prosary) runtime consumes.

## Layout

```
prosary.config.ts  the kit config: the locales, the sources, the presets, the model
src/messages/      the interface messages, in English, one file per group
src/content/       the pages, in English, as Markdown
src/parse.ts       the pipeline the pages are built with, for Markdown the API serves
.cache/            the translation cache: each locale's translations (committed)
.env               the model's API key, which `pnpm translate` loads (yours, not committed)
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

## Pages

A page is Markdown with YAML front matter. The front matter is what
`@bbf/schema` says a page carries: every page has a `title` and a
`description`, and a page adds what it needs — the home page its `hero`, the
events page its `events`, an event's page its
`image`.

The build runs each page through `@prosary/parse` with the presets
`prosary.config.ts` lists:

- `matter()` moves the front matter onto the root of the page's tree.
- `gfm()` reads GitHub Flavored Markdown: tables, task lists, footnotes.
- `mdc()` reads the block syntax Nuxt Content did — `::invite-grid` …
  `::`, nested with more colons, and `::map-embed{src="…"}` — and builds
  each block as an element marked with its name. The app renders a block
  with the component of that name under `apps/web/app/components/prose/`;
  a block no component renders is a plain `div`.
- `rehype-slug` gives every heading an id, which a page's table of contents
  links to.

Every page is built in the form the app renders, an HTML tree as JSON, to
`.output/content/<locale>/<page>.json`.

## Locales

English is the only locale, and the only language authored. Every other
locale is translated by a model, in a step of its own — never the build. CI
runs it (`.github/workflows/translate.yml`) on every pull request and every
push to `main`, and commits what changed back to the branch; a developer can
run it too:

1. `pnpm translate` writes what each locale is missing, or has out of date,
   to `.cache/<locale>/`, mirroring the sources file for file. The lock beside
   them (`.cache/.prosary.lock.json`) records what each translation was made
   from, so a run only translates what changed since the last.
2. `.cache/` is committed — by CI, or by you with the change to the sources.
   It is the cache that keeps every build offline and the same: nothing is
   translated twice, and no build calls a model.
3. `pnpm build` compiles the sources and `.cache/` into `.output/`, every
   locale's messages and pages among them. A message or page a locale has no
   translation of is built from the English source.

To add a locale, list it under `translate.targets` in `prosary.config.ts`
and run `pnpm translate`. That needs `ANTHROPIC_API_KEY`: copy `.env.example`
to `.env` and fill it in: the `translate` script loads the file, through
Node's `--env-file-if-exists`, and the config knows nothing of it (CI sets
the variable from the repository secret of the same name).
The model is `translate.model` in the config — any AI SDK provider's.
`pnpm translate:check` lists what a run would translate without calling the
model, and exits 1 when there is anything.

Leave the files under `.cache/` as the model wrote them. The lock tells a
translation it wrote from one edited by hand, and keeps a hand-edited one
even when its source changes. One exception: the build reads a page's front
matter as strict YAML, so a translated value with a colon in it has to be
quoted — the translations of the connect page's `bio` lines are.

## Exports

- `@bbf/prose`: the `contract` a prosary service is made from, the
  `locale`, `locales`, `messages` and `documents` lists, the `isLocale` /
  `isKey` guards, and the `Locale`, `Key`, `Document`, `Element`,
  `Directive` and `Arguments` types. Carries no message text.
- `@bbf/prose/bundles`: a lazy loader per locale, each resolving to that
  locale's compiled messages.
- `@bbf/prose/parse`: `parse`, Markdown to the HTML tree, through the
  presets `prosary.config.ts` lists — the pipeline the pages are built with,
  for the Markdown the API serves. A bio or an event's body, stored as
  Markdown, is read here and shaped for the wire by `@bbf/utils`, so it
  renders as a page does. It imports the config, `@prosary/parse` and
  `rehype-slug`, and nothing heavier: no kit, no model, no key.

The pages have no export: the app's prosary module serves them from this
package's build, as `/_prosary/content/<locale>/<page>.json`.

```ts
import { makeProsary } from "prosary";
import { contract, locale } from "@bbf/prose";
import { bundles } from "@bbf/prose/bundles";

const prosary = makeProsary(contract, {
  locale,
  messages: await bundles[locale](),
});
prosary.format("navigation.home"); // "Home"
```

## In the app

The web app hands the build to `@prosary/nuxt` in `nuxt.config.ts` —
`prosary: { build: "@bbf/prose" }` — which provides `$t` on the Nuxt app and
serves the pages. A component calls a message it names
(`$t.navigation.open()`); data carries one by key, typed as
`AppProsaryMessage`, and resolves it where it renders (`$t(link.label)`).
The header and footer in `app.config.ts` are data of that kind. Nuxt reads
the built output when it loads its config, so restart `pnpm dev` after
rebuilding this package.

The locale is in the route: English at `/about-us`, Spanish at
`/es/about-us`. The app adds each target locale's routes from this package's
`locales`, so listing a new one here is all it takes.

A page reaches the app through `usePage`, which fetches the page the route
names in the route's locale, checks its front matter against
`@bbf/schema`, and hands back the front matter over the page's body. The
body renders through `<Prose>`, with the overrides under
`app/components/prose/`.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm translate`: brings `.cache/` up to date with the sources. CI runs it
  on pull requests and pushes to `main`.
- `pnpm translate:check`: reports what `pnpm translate` would do.
- `pnpm test`: rebuilds, then checks the contract, the bundle and the pages
  against their sources.
