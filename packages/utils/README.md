# @bbf/utils

The transforms between the site's two shapes of a thing: the row
[`@bbf/database`](../database) returns, named by its columns, and the wire
type [`@bbf/schema`](../schema) says the API speaks. Every app that reads
the database and answers with the API's shapes, or takes the API's inputs
and writes them, runs the same ones, declared once here.

A transform is a pure function, typed against both packages. `dto/` takes a
row and builds the model the API answers with: `toChurchEvent`,
`toStaffMember`, `toSermon`. `dao/` takes an input a request carries and
builds the arguments a query takes: `toEventArguments`,
`toStaffArguments`, `toSermonArguments`. Nothing here touches a
connection, a request or the runtime: an app's composable runs the query
and hands the row or the body here.

## Layout

```
src/dto/        a row into the model the API answers with, one file per kind
  event.ts      toChurchEvent: any row of the events into a ChurchEvent
  hast.ts       toHast: a column of Markdown into the Hast the API answers with
  staff.ts      toStaffMember: a row of the staff into a StaffMember
  sermon.ts     toSermon: any row of the sermons into a Sermon
src/dao/        an input into the arguments a query takes, one file per kind
  event.ts      toEventArguments: an EventBody into what admin.events.create takes
  staff.ts      toStaffArguments: a StaffBody into what admin.staff.create takes
  sermon.ts     toSermonArguments: a SermonBody into what admin.sermons.create takes
src/types.ts    the rows and the arguments the transforms speak, from the contract
src/index.ts    every transform
tests/dto/      what each model is built as, from each shape of row
tests/dao/      what each argument is written as, from each body
tests/types.ts  the rows each transform takes and the queries its output fits
tests/database.test.ts  the round trip, through a Postgres in memory
```

A kind of thing has a file of its name under each direction, as it has
under the schema's `models/` and `input/`. A transform is `to<What>`, named
for what it builds. A new one is a function in the file of its kind, or a
new file exported from that directory's `index.ts`, and the row or
arguments type it speaks goes in `types.ts`.

## What a transform does

The database and the schema were drawn to the same shapes, so most of a
transform is the difference between a column and a field. What a row has
null in, a model leaves out: a `summary`, a `note`, a `location`, an
event's `end`, a sermon's `speaker` or `video`. What a body leaves out, the
arguments write as null, so an update that passes no `date` clears one; what
a body defaults, a member's `position` and `status` and an event's or a
sermon's `status`, is written as the body parsed it. A time comes out of
Postgres as `HH:MM:SS` and the API says `HH:MM`; a `date` comes out as
`YYYY-MM-DD`, as the API says it.

A row's columns differ by query. `web.events.weekly` has no `date` and
`web.events.upcoming` no `day` or `weeks`, each knowing its kind of event
has none, and every list of the events has no `body`, which is the event's
own page's to carry, so `EventRow` lets a row do without those four and
`toChurchEvent` takes any query's row of the events, the admin's included.
`web.sermons.list` leaves out a sermon's `body` the same way, and
`SermonRow` lets it. Columns a model has no field for go nowhere: an admin
row's `id`, `position`, `status` and timestamps.

A column that holds Markdown — a bio, an event's body — reaches the wire
as the HTML tree the app renders, not as the string. `toHast` reads it
through `@bbf/prose/parse`, the pipeline the pages are built with, and
builds the schema's `hast` from the parser's tree node by node: an element's
tag, its attributes and what it holds, or a run of text. The position the
parser kept is not built, nor is an attribute left `undefined`, nor a node
Markdown never makes. Nothing is cast: the parser's shape goes in, the
wire's comes out, as with any row. `toStaffMember` runs a member's `bio`
through it, `toChurchEvent` an event's `body` and `toSermon` a sermon's;
the body a request carries, and the column, stay Markdown.

`toEventArguments`, `toStaffArguments` and `toSermonArguments` build what
`create` takes; an `update` takes the same and the `id` of the row it
replaces, so it is spread with one. `tests/types.ts` proves both fit, and that a row from
every query of a kind is taken, so a column renamed or a field added on
either side fails `pnpm typecheck` here, before it reaches an app.

## Exports

- `@bbf/utils`: every transform. `@bbf/utils/dto` and `@bbf/utils/dao`
  reach one direction, and `@bbf/utils/dto/event` and the like one file.
- `@bbf/utils/types`: `EventRow`, `StaffRow`, `SermonRow`, the rows the
  `dto/` transforms take, and `EventArguments`, `StaffArguments`,
  `SermonArguments`, what the `dao/` transforms build, each derived from
  the database's contract through `bezoar`.

The package exports its sources, as `@bbf/schema` does: there is nothing
to build. `@bbf/database` and `bezoar` are imported for their types alone,
and `@bbf/schema` for its types; what runs is `@bbf/prose/parse`, the
Markdown pipeline, and `objectively`, the typed object helpers that keep
the transforms free of casts.

```ts
// server/composables/events.ts
import { toChurchEvent, toEventArguments } from "@bbf/utils";

export const useEvents = (event: H3Event) => {
  const db = useDatabase();
  const weekly = () =>
    db.web.events.weekly().then((rows) => rows.map(toChurchEvent));
  const create = (body: EventBody) =>
    db.admin.events.create.first(toEventArguments(body));
  const update = (id: number, body: EventBody) =>
    db.admin.events.update.first({ ...toEventArguments(body), id });
  return { weekly, create, update };
};
```

## Scripts

- `pnpm test`: checks what each transform builds from each shape it takes,
  and runs the round trip — a body written through `dao/` read back
  through `dto/` — over a PGlite in memory with the migrations applied and
  the seeds run, through `@bezoar/testing`.
- `pnpm typecheck`: checks the transforms and the tests against
  `@bbf/database`'s build and `@bbf/schema`'s types.
