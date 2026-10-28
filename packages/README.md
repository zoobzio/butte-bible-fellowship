# packages

The church's own code, framework-free: what the site is made of, declared
once and built into what an app imports. A package here knows nothing of
Nuxt or of any app; it is the data, the words, the look and the rules of
the site, each in the form that describes it best — SQL, Markdown, JSON, a
zod schema — built by its kit into a typed contract. A package in
[`integrations/`](../integrations) fits these to a framework, and `apps/*`
build on that.

| package                     | what it is                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`@bbf/assets`](assets)     | the static files: images, favicon, the design system's stylesheet                                                           |
| [`@bbf/database`](database) | the database as SQL — migrations, seeds, queries — built by [bezoar](https://github.com/zoobzio/bezoar) into a typed client |
| [`@bbf/icons`](icons)       | the icons by role, built by [icon-sheets](https://github.com/zoobzio/icon-sheets) into SVG sprites                          |
| [`@bbf/patents`](patents)   | the admin's scopes, roles and issuers, built by [letters-patent](https://github.com/zoobzio/letters-patent)                 |
| [`@bbf/prose`](prose)       | the words: interface messages and pages, built by [prosary](https://github.com/zoobzio/prosary) per locale                  |
| [`@bbf/schema`](schema)     | the shapes the APIs speak, as [zod](https://zod.dev) schemas, and the wire types inferred from them                         |
| [`@bbf/theme`](theme)       | the design tokens: a palette over the aurora preset, built by [untheme](https://github.com/zoobzio/untheme)                 |
| [`@bbf/toolbox`](toolbox)   | the lint, compiler and test configuration every package extends                                                             |
| [`@bbf/utils`](utils)       | the transforms between a database row and an API shape                                                                      |

Most stand alone. `@bbf/schema` names what crosses the wire and
`@bbf/database` what is stored; `@bbf/utils` is the one that knows both,
and turns the one into the other. `@bbf/toolbox` is a dev dependency of
the TypeScript packages, never a runtime one.

A package that is built writes `.output/` and exports that; the sources
and the kit never reach an app. The build runs from the package's
`prepare` script, so `pnpm install` leaves every package ready.
