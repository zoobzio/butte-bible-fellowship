# @bbf/schema

The shapes the site's APIs serve, as [zod](https://zod.dev) schemas, and the
types inferred from them: the wire types. One declaration serves every side
of a request. The server checks what it hands out against it, the app types
its props and composables with it and checks what it receives, and the
pages' front matter is read through it.

A schema here is what crosses the wire, not what is stored. A row of
[`@bbf/database`](../database) is the database's shape, named by its
columns; a server util turns it into the shape declared here before an
endpoint answers with it.

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

One file per kind of thing the APIs speak of, named for it in the plural;
the schemas inside are `camelCase` values, and `types.ts` infers each one's
type under its `PascalCase` name. A new wire type is a new schema in the
file of its kind, or a new file, and a type beside it in `types.ts`.

The package exports its sources: there is nothing to build. Every consumer
here reads TypeScript from a workspace package as it is.

## Exports

- `@bbf/schema`: the schemas, each a `camelCase` value — `eventDay`,
  `churchEvent`, `staffMember`, `hero`, `page`, `sermon` — with `sermons`,
  the list the API answers with, and `EVENT_DAYS`, the days of the week in
  the order `eventDay` accepts them.
- `@bbf/schema/types`: the type each schema infers, under its `PascalCase`
  name — `EventDay`, `ChurchEvent`, `StaffMember`, `Hero`, `Page`, `Sermon`.
  Nothing here reaches a bundle: a file that only needs the shape imports
  from here and carries no zod.

```ts
import { churchEvent } from "@bbf/schema";
import type { ChurchEvent } from "@bbf/schema/types";

const event: ChurchEvent = churchEvent.parse(frontMatter);
```

## In the app

`usePage` checks a page's front matter against `page` as it reads it, so a
page is typed where it is queried. `useSermons` parses the API's answer with
`sermons` rather than trusting it, and the server's `parseSermonFeed` builds
each `Sermon` from the feed.

## Scripts

- `pnpm test`: checks what each schema accepts and rejects.
