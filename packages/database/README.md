# @bbf/database

The site's database, as SQL, built with [bezoar](https://github.com/zoobzio/bezoar)
into a typed client. A migration, a seed, or a query is one `.sql` file
under `src/`; `bezoar build` applies the migrations and the seeds to a
Postgres in memory, describes every query, and writes `.output/`, which is
what this package exports. An app imports the build and has the database:
the kit and the sources never reach it.

The tables are the site's three kinds of data: `staff`, who serve the
church, each in a `staff_role` — pastor, elder, staff — which is also the
order the site lists them in; `events`, each held once on a date or weekly on a day, with the page
written about it; and `sermons`, each preached on a day, with the page
written about it and its recording on the church's YouTube channel. Beside them, `users` is who may sign in to the admin app.
Content
the admin app edits carries a `content_status` — draft, published, archived —
and only the published reaches the site.

The queries are grouped by the app that runs them. `web` is the reads the
site needs and nothing else; `admin` is the full set of reads and writes
the admin app will be built on. The service nests the same way:
`db.web.events.weekly()` and `db.admin.events.create({ … })`. A role of the
same name holds each app to its group: `web` may only read the tables, and
`admin` may read and write them, so the database refuses what the service
would not have offered.

## Layout

```
bezoar.config.ts   the kit config: the output directory, the defaults for the rest
src/migrations/    the schema, forward only: staff, events, sermons, users
src/seeds/         the staff and events the content lists, and the first admin user, each safe to run again
src/queries/web/   what the site reads: staff, events, sermons
src/queries/admin/ what the admin app will read and write: the same, in full
src/roles/         what each app's role may do: web reads, admin reads and writes
tests/             the build, run through @bezoar/testing
```

A query is named for its path: `events/list.sql` is `events.list`, and a
slot is `:name`, as in psql. A cast types a slot, an alias names a column,
and `RETURNING` types a write. The SQL decides what a call returns: a
statement with columns returns its rows, with `first` beside it for the
first row or `null`; one with none returns the count of the rows it changed.

## Queries

A query is named for what it does: `list` lists, `fetch` reads one.
`web.staff.list` lists the published staff in their order: by role, then
by name. The events the web reads are the published ones:
`web.events.list` is the calendar's feed — every repeating event Sunday
first, then the one-offs on or after a date — and `web.events.weekly` and
`web.events.upcoming` are its two halves on their own; `web.events.fetch`
is an event's own page by slug, and alone carries the event's `body`, the
Markdown written about it, which the lists leave out. `web.sermons.list`
takes the newest published sermons, as many as asked, and
`web.sermons.fetch` is a sermon's own page by slug, which alone carries its
`body`, as an event's does.

`admin.staff` has `list`, `fetch`, `create`, `update` and `delete`, over
every member whatever their status. `list` is
one page, `size` rows from `offset`, sorted by the column `sort` names —
`name`, `role`, `status`, `email`, `phone`, `created_at` or `updated_at` —
in `direction`, `asc` or `desc`, a null last either way, and then in the
site's order, by role and name, so `role` ascending is the site's order
itself; each row carries `total`, how many rows the whole search holds, so
a page and its count are one query. It takes the search the admin
app's table commits, every part of it optional: `q`, text the name, the
email, the phone or the summary must carry whatever its case, taken as
typed, so a `%` or `_` is the character and not a wildcard; a role held,
`role_is`, or not held, `role_not`, and a status the same, `status_is` and
`status_not`; whether the `email`, `phone`, `summary` or `photo` is filled
in, `present` or `missing`, an empty one counted as missing; and a day each
member was last changed or added `before`, `after` or `on`, as
`updated_before` and the like. Left out or null, a part narrows nothing. The days are read in `tz`,
the church's IANA time zone, which every search passes. `admin.events` and `admin.sermons` have `list`, `fetch`,
`create`, `update` and `delete`, by `id`.

`admin.users` has the same, and two more for signing in. A user is added
by their email and a `user_role` — `admin` or `editor`, the roles of
`@bbf/patents` — and is bound to Google's subject (`sub`) the first time
they sign in: `admin.users.claim` binds it to the user added by that
email, when no subject is bound yet, and `admin.users.subject` finds the
user by it on every request after. An `update` that changes the email
unbinds the user until they sign in with the new one. The admin app passes
`claim` only an email Google has verified.

A member's `bio` is `jsonb`: the HTML tree (hast) the app renders, written
as the admin's editor hands it over and served to the site as it is, where
an event's or a sermon's `body` is the Markdown it was written as.

An argument written into a column the schema lets be null — a summary, a
bio, a body, an image, a note, a location, an end time, a sermon's
`speaker` or `video`, an event's `date` or `day` or `weeks` — is optional,
and takes `null`; left out, it is null. Every other argument is required, a
member's, an event's or a sermon's `status` among them. An event is created
with its `date` or its `day`, never both, and the schema refuses anything
else. An `update` replaces every field, so one that passes a `date` and no
`day` makes the event a one-off. A sermon's `slug` and its `video`,
YouTube's id for its recording, are each taken once; a sermon not yet
recorded has no video, and any number may.

## Roles

A role is `src/roles/<role>.sql`, named for the role, and holds the whole
of its grants: `roles` of bezoar revokes every privilege the role has
before it runs the file, so a grant taken out of the file is gone after
the next run. The build declares each role before the migrations and
applies its grants after them, and then plans every query as every role,
so the contract carries, by role, the queries the role may run.

`web` has `SELECT` on `staff`, `events` and `sermons`, and nothing else.
It may run every read of them, the admin app's plain reads among them, and
no write; it may not read `users` at all. `admin` has `SELECT`, `INSERT`,
`UPDATE` and `DELETE` on the four tables, and may run every query. Each `id` is an identity column, which
Postgres fills without a privilege on its sequence, so the tables are the
whole of each grant.

Each app scopes its service to its role, `bezoar: { role: "web" }` in
`@bezoar/nuxt`, and its connection then takes the role on every statement.
Who logs in as a role is the deployment's, not the package's: a role here
is a group that cannot log in, and the deployment makes a login user per
app, each a member of its role alone, with
`CREATE ROLE bbf_web LOGIN PASSWORD '…' IN ROLE web`. In production each
app connects as its own user, so the database holds the app to its role
whatever the app does, and the user can neither migrate nor grant: the
owner of the database applies the roles, the migrations and the grants
before the app deploys. In development each app runs a Postgres in the
process, applies everything as it starts, and takes its role as the one
superuser.

## Exports

- `@bbf/database`: the `contract`, the `isQuery` guard, and the `Contract`
  and `Query` types a consumer derives `Arguments`, `Row` and `Returns`
  from, through `bezoar`. The module holds no SQL.
- `@bbf/database/queries`: the SQL of each query, by name.
- `@bbf/database/migrations`: each migration as data, with its version and
  checksum, for `migrate`.
- `@bbf/database/seeds`: each seed as data, for `seed`.
- `@bbf/database/roles`: each role's grants as data, for `roles`.

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
  PGlite in memory with the roles declared, the migrations applied, the
  grants applied and the seeds run, and one service per role beside it.
- `pnpm typecheck`: checks the config and the tests against the build.
