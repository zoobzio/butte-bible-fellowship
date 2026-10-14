# @bbf/validators

The shapes of the site's data, as [zod](https://zod.dev) schemas, and the
types inferred from them. One declaration serves three readers: Nuxt
Content, which draws a collection's schema from it; the app, which types its
props and composables with it; and the API, which checks what it hands out
against it.

## Layout

```
src/events.ts    an event of the church, and the days one can repeat on
src/staff.ts     someone who serves the church
src/pages.ts     a page's front matter: its hero, events, image and staff
src/sermons.ts   a sermon, as the YouTube feed lists it
src/types.ts     the type each schema infers
src/index.ts     every schema
tests/           what each schema accepts and rejects
```

The package exports its sources: there is nothing to build. Every consumer
here reads TypeScript from a workspace package as it is.

## Exports

- `@bbf/validators`: the schemas, each a `camelCase` value — `eventDay`,
  `churchEvent`, `staffMember`, `hero`, `page`, `sermon` — with `sermons`,
  the list the API answers with, and `EVENT_DAYS`, the days of the week in
  the order `eventDay` accepts them.
- `@bbf/validators/types`: the type each schema infers, under its
  `PascalCase` name — `EventDay`, `ChurchEvent`, `StaffMember`, `Hero`,
  `Page`, `Sermon`. Nothing here reaches a bundle: a file that only needs
  the shape imports from here and carries no zod.

```ts
import { churchEvent } from "@bbf/validators";
import type { ChurchEvent } from "@bbf/validators/types";

const event: ChurchEvent = churchEvent.parse(frontMatter);
```

## In the app

`content.config.ts` gives every page collection `page` as its schema, so a
page's front matter is checked as it is read and typed where it is queried.
`useSermons` parses the API's answer with `sermons` rather than trusting it,
and `parseSermonFeed` builds each `Sermon` from the feed.

Studio's form hints — which field is a media path — are not here. They are
Nuxt Content's concern, and belong where the collection is defined.

## Scripts

- `pnpm test`: checks what each schema accepts and rejects.
