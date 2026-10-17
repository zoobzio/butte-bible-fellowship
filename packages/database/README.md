# @bbf/database

The site's database, as SQL, built with [bezoar](https://github.com/zoobzio/bezoar)
into a typed client. A migration, a seed, or a query is one `.sql` file
under `src/`; `bezoar build` applies the migrations and the seeds to a
Postgres in memory, describes every query, and writes `.output/`, which is
what this package exports. An app imports the build and has the database:
the kit and the sources never reach it.

The tables are the site's three kinds of data, each the shape its
validator in `@bbf/validators` already gives it: `staff`, who serve the
church; `events`, each held once on a date or weekly on a day; and
`sermons`, as the church's YouTube feed lists them.

The queries are grouped by the app that runs them. `web` is the reads the
site needs and nothing else; `admin` is the full set of reads and writes
the admin app will be built on. The service nests the same way:
`db.web.events.weekly()` and `db.admin.events.create({ … })`.

## Layout

```
bezoar.config.ts   the kit config: the output directory, the defaults for the rest
src/migrations/    the schema, forward only: staff, events, sermons
src/seeds/         the staff and the events the content lists, each safe to run again
src/queries/web/   what the site reads: staff, events, sermons
src/queries/admin/ what the admin app will read and write: the same, in full
test/              the build, run through @bezoar/testing
```

A query is named for its path: `events/list.sql` is `events.list`, and a
slot is `:name`, as in psql. A cast types a slot, an alias names a column,
and `RETURNING` types a write. The SQL decides what a call returns: a
statement with columns returns its rows, with `first` beside it for the
first row or `null`; one with none returns the count of the rows it changed.

## Queries

`web.staff.list` lists the staff in order. `web.events.weekly` lists every
repeating event Sunday first, and `web.events.upcoming` the one-offs on or
after a date; `web.events.bySlug` is an event's own page. `web.sermons.latest`
takes the newest as many as asked, and `web.sermons.byId` one of them.

`admin.staff` and `admin.events` each have `list`, `byId`, `create`,
`update` and `delete`. `admin.sermons` has `list`, `byId`, `upsert`, which
writes a sermon as the feed lists it or brings it up to date, and `delete`.

An argument written into a column the schema lets be null — a bio, a note,
a location, an end time, an event's `date` or `day` or `weeks` — is
optional, and takes `null`; left out, it is null. Every other argument is
required. An event is created with its `date` or its `day`, never both,
and the schema refuses anything else. An `update` replaces every field,
so one that passes a `date` and no `day` makes the event a one-off.

## Exports

- `@bbf/database`: the `contract`, the `isQuery` guard, and the `Contract`
  and `Query` types a consumer derives `Arguments`, `Row` and `Returns`
  from, through `bezoar`. The module holds no SQL.
- `@bbf/database/queries`: the SQL of each query, by name.
- `@bbf/database/migrations`: each migration as data, with its version and
  checksum, for `migrate`.
- `@bbf/database/seeds`: each seed as data, for `seed`.

```ts
import { makeBezoar } from "bezoar";
import { pg } from "@bezoar/pg";
import { contract } from "@bbf/database";
import { queries } from "@bbf/database/queries";

const db = makeBezoar(contract, { executor: pg(pool), queries });
```

## Scripts

- `pnpm build`: writes `.output/` from `src/`. Runs on install too, as
  `prepare`, so a workspace package can import the build without a step.
- `pnpm test`: builds a service over the output with `@bezoar/testing`, a
  PGlite in memory with the migrations applied and the seeds run.
- `pnpm typecheck`: checks the config and the tests against the build.
