# @bbf/prose

The church's words: the site's interface messages and the admin's, built by
[`@prosary/kit`](https://github.com/zoobzio/prosary/tree/main/packages/kit)
into a typed contract and a bundle of compiled messages per locale — what the
[prosary](https://github.com/zoobzio/prosary) runtime consumes.

## Layout

```
prosary.config.ts  the kit config: the locales, the sources, the presets, the model
src/messages/      the site's interface messages, in English, one file per group
src/messages/admin/  the admin's, the same way, under `admin`
.cache/            the translation cache: each locale's translations (committed)
.env               the model's API key, which `pnpm translate` loads (yours, not committed)
.output/           the kit's output, every locale's (generated, not committed)
```

Each message file is a FormatJS message-descriptor document, and its keys
nest under its path: `home` in `navigation.json` is the message
`navigation.home`, called as `$t.navigation.home()`, and `save` in
`admin/editor.json` is `admin.editor.save`. The `description` beside each
message is the note a translator reads.

The site's messages stand at the top level; the admin's under `admin/`.
`appearance.json` and `language.json` name the controls both apps offer,
through the `@bbf/nuxt` layer.

| File              | Messages                                                    |
| ----------------- | ----------------------------------------------------------- |
| `site.json`       | the church's name, its tagline and the meta description     |
| `navigation.json` | the primary navigation: its links and accessible names      |
| `footer.json`     | the footer's headings, service time and copyright line      |
| `appearance.json` | the header's controls: color scheme, theme and its settings |
| `language.json`   | the language picker: its button, its list and its search    |
| `page.json`       | page-level words: not found, contents, the way back         |
| `home.json`       | the home page's hero: its heading, paragraph and button     |
| `about.json`      | the about page: its title                                   |
| `sermons.json`    | the sermons page: its titles, play button, channel link     |
| `events.json`     | the events pages, their title, an event’s days, the week    |
| `connect.json`    | the connect page: its titles, its cards, its map’s name     |
| `roles.json`      | a staff member's roles, as the site and the admin name them |

| File                    | Messages                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `admin/site.json`       | what the admin is: the line under the church's name            |
| `admin/navigation.json` | the header's links: the sections the admin edits               |
| `admin/login.json`      | the login page                                                 |
| `admin/account.json`    | the account menu: its name and the way out                     |
| `admin/editor.json`     | what every editor shares: its buttons, prompts and fields      |
| `admin/events.json`     | the events section: its pages' titles and not found            |
| `admin/event.json`      | an event's fields, its picture's controls, and the hints       |
| `admin/weeks.json`      | the weeks of the month a repeating event is held in            |
| `admin/staff.json`      | the staff section: its pages' titles and not found             |
| `admin/member.json`     | a staff member's fields, their photo's controls, and the hints |
| `admin/content.json`    | the content section: its pages' titles and not found           |
| `admin/page.json`       | a page's metadata fields, its body's editor, and the hints     |

Messages are ICU MessageFormat, where an ASCII apostrophe is the escape
character — write a typographic one (`You’re`).

## Pages

The site's pages are not written here as Markdown any more. What two of
them say, the home page and About Us, is in the database, in
`@bbf/database`'s `content` table, where the admin's Content section
writes it, as an event's own page is. The other three, Connect, Events and
Sermons, had only a title to their name, and the connect page its cards:
those are messages here now (`connect.head`, `events.head`,
`sermons.head`, and the rest of `connect.json`), translated as every
message is. The site answers for each at the
address a built page had, `/i18n/content/<locale>/<page>.json`, from
`server/routes/i18n/[...path].ts`, in the one language it is written in.

The config still names `content` and its presets, so the contract carries
what the app's `<Prose>` reads: that a page is an HTML tree, and that
`dataDirective` marks one of the site's blocks — an `invite-card`, a
`map-embed` — which the app renders with the component of that name under
`apps/web/app/components/prose/`. The build finds no page and writes none.

The Markdown the API still serves, a sermon's body, is built to the same
tree by `@bbf/utils`, through `@prosary/parse` with the presets
`prosary.config.ts` lists less `matter()`, so it renders as a page does; a
preset added here belongs there too.

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
   locale's messages among them. A message a locale has no translation of
   is built from the English source.

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
even when its source changes.

## Exports

- `@bbf/prose`: the `contract` a prosary service is made from, the
  `locale`, `locales`, `messages` and `documents` lists, the `isLocale` /
  `isKey` guards, and the `Locale`, `Key`, `Document`, `Element`,
  `Directive` and `Arguments` types. Carries no message text.
- `@bbf/prose/bundles`: a lazy loader per locale, each resolving to that
  locale's compiled messages.

The pages have no export, and no build: the site serves them from the
database, as `/i18n/content/<locale>/<page>.json`.

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

## In the apps

The `@bbf/nuxt` layer hands the build to `@prosary/nuxt` —
`prosary: { build: "@bbf/prose" }` — which provides `$t` on the Nuxt app of
every app that extends the layer. A component calls a
message it names (`$t.navigation.open()`); data carries one by key, typed as
`AppProsaryMessage`, and resolves it where it renders (`$t(link.label)`).
Each app's header, and the web's footer, in its `app.config.ts`, are data
of that kind. Nuxt reads the built output when it
loads its config, so restart `pnpm dev` after rebuilding this package.

The locale is the visitor's own: the module picks it from their cookie, else
their browser's languages, and the layer's `LanguagePicker` switches it in
place. Listing a new locale under `translate.targets` is all it takes to
offer it in both apps.

A page reaches the app through `usePage`, which fetches the page the route
names, from the database's `content`, checks its front matter against
`@bbf/schema`, and hands back the front matter over the page's body. The
body renders through `<Prose>`, with the overrides under
`app/components/prose/`.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm translate`: brings `.cache/` up to date with the sources. CI runs it
  on pull requests and pushes to `main`.
- `pnpm translate:check`: reports what `pnpm translate` would do.
- `pnpm test`: rebuilds, then checks the contract and the bundle against
  their sources.
