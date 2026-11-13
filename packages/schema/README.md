# @bbf/schema

The shapes the site's APIs speak, as [zod](https://zod.dev) schemas, and the
types inferred from them: the wire types. One declaration serves every side
of a request. The server checks what it is asked and what it hands out
against it, the app types its props and composables with it and checks what
it receives, the pages' front matter is read through it, and the OpenAPI
document is built from it: each schema carries its own description and
examples through zod's `.meta()`, as [zod-openapi](https://github.com/samchungy/zod-openapi)
reads them.

A schema here is what crosses the wire, not what is stored. A row of
[`@bbf/database`](../database) is the database's shape, named by its
columns; a transform of [`@bbf/utils`](../utils) turns it into the shape
declared here before an endpoint answers with it, and turns an input here
into a query's arguments before it runs.

## Layout

```
src/models/      what the API answers with: one file per kind of thing
  content.ts     a page of the site as the admin reads it, and a listing of them
  event.ts       an event of the church, the list of them, and the days and times it names
  hast.ts        rich text as the API serves it: an HTML syntax tree of elements and text
  staff.ts       someone who serves the church, the list of them, and their roles
  status.ts      the statuses a sermon passes through
  sermon.ts      a sermon preached at the church, and the list of them
  page.ts        a page's front matter: its title, description and image
  slug.ts        what names a thing in an address
src/input/       what a request carries, one file per group of endpoints
  content.ts     the site's pages: the id of one, the query of the listing, the metadata and the body of a write
  event.ts       the events: the path of one, the query of the list, the body of a write
  staff.ts       the staff: the id of one, the body of a write
  sermon.ts      the sermons: the path of one, the query of the list, the body of a write
src/index.ts     every schema, models and inputs
src/types.ts     the type each schema infers, and nothing else
tests/models/    what each model accepts and rejects
tests/input/     what each input accepts and rejects
tests/openapi.ts the document the schemas render to
```

A kind of thing the API speaks of has a file under `models/`, named for it
in the singular, and the group of endpoints around it has a file of the
same name under `input/`. The schemas are `camelCase` values, and
`types.ts` infers each one's type under its `PascalCase` name. A new wire
type is a new schema in the file of its kind, or a new file, exported from
that directory's `index.ts`, and a type beside it in `types.ts`.

A model is the response: `churchEvent`, `staffMember`, `sermon`,
`page`, with `churchEvents`, `staffMembers` and `sermons`, the lists the
API answers with, and the primitives they are built from — `eventDay`,
`eventTime`, `slug`, `contentStatus`, `staffRole`, and `hast`, rich text
as an HTML syntax tree. A column written as Markdown — a sermon's `body` —
goes over the wire as `hast`: the tree the site's pages are built to,
which the app renders with its own components, so the wire never carries
Markdown and the app never parses it. `@bbf/utils`'s `toHast` builds it,
through the same presets as the pages. A body still takes the Markdown:
`sermonBody.body` is the string as written. A member's `bio` and an
event's `body` are `hast` everywhere: the admin's editor writes the tree,
`staffBio.bio` and `eventArticle.body` carry it, and the site reads it as
it was stored. A member is written in three parts, each on its own, so a
save of one never replaces another: `staffBody` is their details,
`staffBio` their bio, and `staffAvatar` their photo as it is uploaded, a
JPEG, PNG or WebP file of `STAFF_AVATAR_SIZE` at most. An event is written
the same way: `eventBody` is its details, `eventArticle` what is written
about it, and `eventImage` its picture as it is uploaded. A page of the site
is written in two: `contentBody` is its metadata, what a page's front matter
carried when the pages were Markdown — its slug, `index` for the home page,
its title and its description — and `contentArticle` what is written on
it, as `hast`, the site's own blocks among its elements. `contentForm` is
the metadata as the admin's form holds it. An input is one part of a request, named for the
group and the part: `eventPath` is the path parameters of one event,
`eventsQuery` the query of the events list, `eventBody` what a write
carries. An event is written with the date it is held and whether it is
`recurring`: a recurring event is held every week on that date's day of
the week, which a record names as its `day` and the site's `churchEvent`
carries in place of the date. A body says what a model cannot: only a
recurring event picks its weeks, and an end comes after its start — the
rules the database's constraints keep, checked before a query runs. A member's phone number is ten digits, however they are
typed: `staffPhone` takes the usual ways of writing one and keeps it one
way, as `530-555-0100`. Only a write is held to it, so a record with an
older number still reads. A sermon's body also carries what the site never
shows: the `status` that decides whether it reaches the site, a draft
until the body says otherwise. A member and an event carry none: whoever
is on the staff, and whatever event is written, is on the site.

A sermon is what the church preached, not what YouTube lists: its `date` is
the day it was preached, its `speaker` who preached it, and its `video`
YouTube's id for its recording, when it has one. Its picture is its `image`
or, left out, the video's thumbnail, which the app derives from the id.

The package exports its sources: there is nothing to build. Every consumer
here reads TypeScript from a workspace package as it is.

## OpenAPI

Every schema is documented where it is declared. A model or a body is
`.meta({ id, description })`, so the document names it once under
`components.schemas` and refers to it from every operation that uses it:
`ChurchEvent`, `StaffMember`, `Sermon`, `Page`, `EventBody`,
`StaffBody`, `StaffBio`, `SermonBody`. A primitive used by both — `EventDay`, `EventTime`,
`ContentStatus`, `StaffRole` — is one component too, and so is `Hast`, with
`HastElement` and `HastText`, which refer to each other as a tree does; rendered the same in a request and a response. A field is
`.meta({ description, examples })`, and its format comes from its zod type:
`z.iso.date()` is `date`, `z.iso.datetime()` is `date-time`, `z.url()` is
`uri`, `z.email()` is `email`, a regex is its `pattern`.

The server builds the document, as it knows the paths. A path or query
object goes under `requestParams`, a body under `requestBody`, a model
under `responses`, and the document names and links them all:

```ts
import { createDocument } from "zod-openapi";
import { churchEvent, eventPath } from "@bbf/schema";

createDocument({
  openapi: "3.1.0",
  info: { title: "Butte Bible Fellowship", version: "1.0.0" },
  paths: {
    "/api/events/{slug}": {
      get: {
        requestParams: { path: eventPath },
        responses: {
          200: {
            description: "The event",
            content: { "application/json": { schema: churchEvent } },
          },
        },
      },
    },
  },
});
```

`tests/openapi.test.ts` builds this document over every schema and checks
what it renders: the components, their references, the parameters.

## Exports

- `@bbf/schema`: every schema, each a `camelCase` value, with `EVENT_DAYS`,
  the days of the week in the order `eventDay` accepts them, and
  `SERMONS_LIMIT`, the most sermons one request lists.
- `@bbf/schema/models`: the models alone; `@bbf/schema/input`: the inputs
  alone. `@bbf/schema/models/event` and the like reach one file.
- `@bbf/schema/types`: the type each schema infers, under its `PascalCase`
  name — `ChurchEvent`, `ChurchEvents`, `EventDay`, `EventTime`, `Hast`, `HastElement`,
  `HastText`, `ContentStatus`, `StaffRole`, `StaffMember`, `StaffMembers`,
  `Page`, `Sermon`, `Sermons`, `Slug`, `EventPath`, `EventsQuery`,
  `EventBody`, `ContentRecord`, `ContentBody`, `ContentForm`, `ContentArticle`,
  `StaffId`, `StaffBody`, `StaffBio`, `SermonPath`, `SermonsQuery`,
  `SermonBody`. Nothing here
  reaches a bundle: a file that only needs the shape imports from here and
  carries no zod.

```ts
import { churchEvent, eventPath } from "@bbf/schema";
import type { ChurchEvent, EventPath } from "@bbf/schema/types";

const { slug }: EventPath = eventPath.parse(getRouterParams(event));
const found: ChurchEvent = churchEvent.parse(row);
```

## In the app

`usePage` checks a page's front matter against `page` as it reads it, so a
page is typed where it is queried. `useStaff` parses the API's answer with
`staffMembers` and `useSermons` with `sermons`, rather than trusting it.

## Scripts

- `pnpm test`: checks what each schema accepts and rejects, and what the
  document renders.
- `pnpm typecheck`: checks the schemas and the tests.
