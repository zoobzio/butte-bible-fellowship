# @bbf/database

The site's database, as SQL, built with [bezoar](https://github.com/zoobzio/bezoar)
into a typed client. A migration, a seed, or a query is one `.sql` file
under `src/`; `bezoar build` applies the migrations and the seeds to a
Postgres in memory, describes every query, and writes `.output/`, which is
what this package exports. An app imports the build and has the database:
the kit and the sources never reach it.

The tables are the site's kinds of data: `home`, `about` and `connect`,
the three pages with a layout of their own, each a table of one row that
holds whatever its layout shows; `content`, the pages written in the admin, each named by
its slug with a title, a description and what is written on it, which the
admin keeps as its content, each filed in one of the `folders` or at the top,
and each a document of the kind its `mime` says, its media type, an article
being the site's own, with a `size` in bytes;
`folders`, the content's folders, each named and inside another or at the
top, however whoever writes it sorts them; `staff`, who serve the
church, each in a `staff_role` — pastor, elder, staff — which is also the
order the site lists them in; `events`, each held on a date, and every
week on that date's day of the week when it is `recurring`, with the page
written about it; and `sermons`, each preached on a day, with the page
written about it and its recording on the church's YouTube channel. Beside them, `users` is who may sign in to the admin app,
and `views` is the arrangements of the admin's lists each of them has saved:
one table for every list, each row a user's own, named for the list it is
over by its `surface`, with the arrangement itself as `payload`.
A sermon carries a `content_status` — draft, published, archived — and
only the published reaches the site; the staff and the events carry none,
and whoever is on the staff, and whatever event or page is written, is on
the site.

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
src/migrations/    the schema, forward only: staff, events, sermons, users, staff search, like escape, search cost, staff status, events search, events trim, content, pages, folders, connect, views, documents
src/seeds/         the staff, the events and the first admin user, each safe to run again
src/queries/web/   what the site reads: home, about, connect, content, staff, events, sermons
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
`web.staff.list` lists the staff, every member, in their order: by role,
then by name. The web reads every event: `web.events.list` is the
calendar's feed — every recurring event by the day of the week its date
falls on, Sunday first, then the one-offs on or after a date — and
`web.events.weekly` and `web.events.upcoming` are its two halves on their
own; `web.events.fetch` is an event's own page by slug, and alone carries
the event's `body`, the rich text written about it, which the lists leave
out. `web.sermons.list`
takes the newest published sermons, as many as asked, and
`web.sermons.fetch` is a sermon's own page by slug, which alone carries its
`body`, as an event's does.

`admin.staff` has `list`, `fetch`, `create`, `update`, `photo`, `bio` and
`delete`, over every member. `create` and `update`
write a member's details, and neither their photo nor their bio: `photo`
sets the photo's URL and `bio` the bio's tree, each on its own and each
null to clear it, so a save of one never replaces another. `list` is
one page, `size` rows from `offset`, sorted by the column `sort` names —
`name`, `role`, `email`, `phone`, `created_at` or `updated_at` —
in `direction`, `asc` or `desc`, a null last either way, and then in the
site's order, by role and name, so `role` ascending is the site's order
itself; with `sort` null, a search lists the nearest first, a row the text
is in before one it is only near, and the rest keep the site's order; each
row carries `total`, how many rows the whole search holds, so
a page and its count are one query. It takes the search the admin
app's table commits, every part of it optional: `q`, text the name, the
email, the phone, the summary or the bio must carry whatever its case,
taken as typed, so a `%` or `_` is the character and not a wildcard, or
must come near enough to in a run of words that a misspelling still finds
its member; `search`, a column the database keeps in step with the five,
carries them as one text under a trigram index (`pg_trgm`), which serves
the substring and the near match alike, the latter by strict word
similarity at the extension's default threshold, the planner told what that
similarity costs (`search_cost`) so it reads the index rather than every
row, or, where those two find
nothing, for the swapped or dropped letter a trigram misses in a short
word, by each word typed coming within an edit or two of a word of the
text (`fuzzystrmatch`), which reads every row and so runs only then; a role held,
`role_is`, or not held, `role_not`; on each text column, the `name`, `email`, `phone`, `summary`
and `photo`, the text it holds or does not, whatever its case, `name_is`
and `name_not`, which take `present` or `missing` too, for whether the
column is filled in, an empty one counted as missing, and the text it
carries, does not carry, starts with or ends with, as typed,
`name_contains`, `name_not_contains`, `name_starts_with` and
`name_ends_with`, a `%` or `_` the character as in the search, by
`like_escape`, and a column left empty not what it does not carry; and a
day each member was last changed or added `before`, `after`, `on`,
`on_or_after` or `on_or_before`, as `updated_before` and the like. Left
out or null, a part narrows nothing. The days are read in `tz`, the
church's IANA time zone, which every search passes.

`admin.events` has `list`, `fetch`, `create`, `update` and `delete`, by
`id`, and as the staff have, a query for each part written on its own:
`image`, the URL of the event's picture, and `body`, the rich text
written about it. `create` and `update` write the details and leave both
alone. Its `list` is searched as the staff's is: a page of `size` rows
from `offset`, each carrying the `total`; `q` looked for in the `search`
column the events trim migration keeps, the title, the slug, the summary
and the text of the body as one text, nearest first when no `sort` is
asked for; whether it recurs and the day of the week its date falls on,
held or not, `recurring_is` and `day_not` and the like; the text filters
on the `title`, `slug`, `summary` and `image`; and the day filters on the
`date` it is held, as it is written, and on the days it was `updated` and
`created`, read in `tz`; and for a calendar, the days it is held within,
`held_from` and `held_to`: a one-off whose date is among them, and a
recurring event that has begun by the last. `sort` names a column, `title`, `slug`, `day`,
`date`, `recurring`, `start_time`, `created_at` or `updated_at`, and after
any sort the admin's own order holds: the recurring events Sunday first,
then the one-offs by date. An event's day of the week is never stored:
`event_day_of` reads it from the date.
`admin.sermons` has `list`, `fetch`, `create`, `update` and `delete`, by
`id`.

`web.home.fetch` and `web.about.fetch` each read the one row of their
table, and take no argument: the page's title and description, what is
written on it, and for the home page its hero — `hero_heading`, one line
of text, of which the site draws what stands between asterisks as the
highlight,
`hero_description`, `hero_action` and `hero_link`, the button and where it
leads, and `hero_image`, the URL of the picture uploaded for it, null
until one is. `admin.home` and `admin.about` have `fetch`, which adds when
the row was last changed, `update`, which writes the metadata, and `body`,
what is written on the page, on its own; `admin.home.image` sets the
picture's URL on its own too, null to clear it. None takes an id, and
there is no `create` and no `delete`: the pages migration makes each row
with its table, with the words the site had, and where the two pages were
rows of the content, `index` and `about-us`, it moves what was written on
them across and takes them out of the content.

`web.connect.fetch` reads the connect page the same way: its title and
description, the header it opens with, and how to find and reach the
church — the `address`, which the site draws the page's map from too, the
`phone`, the `fax`, the `email` and the `hours` its office keeps, a line
of text to a line of the page, each but the address null when the page
says nothing of it — over what is written on it, which is null until the
admin writes it. `admin.connect` has `fetch`, `update` and `body`, as the
other two have. The connect migration makes its row, with the words the
site had in its interface's messages and its configuration.

`web.content.fetch` is a page written in the admin, by its slug, with
its title, description and body, and `web.content.list` the slug of
every one. `admin.content` has `list`, `fetch`, `create`, `update` and
`delete`, by `id`, and `body`, what is written on the page, on its own:
`create` and `update` write the metadata — the slug, the title and the
description — and leave the body alone, and `create` takes the `folder_id`
the page is filed in from the start; `folder` files a page in another
folder afterwards, on its own, null for the top, and leaves when it was
changed as it was. What kind of document a row is, is its `mime`, its media type as it would
be served, lowercase: the content is to hold the site's static assets as
well as its pages, so no list of kinds is kept, and a type is whatever one
is. A page is made an article, `application/vnd.bbf.article+json`, the
site's own type for the tree the admin's editor writes, which the
documents migration gives every page and a row is given when nothing names
another. Its `size` is written with what it holds: `body` sets it to the
bytes of the body as text, zero for none, and whatever writes a document
of another type writes its size. Its `list` is not a page of a search, as the others'
are: it is every page filed in the folder `folder_id` names, or at the top
when it is null, and `sort` names `title`, `slug`, `mime`, `size`,
`created_at` or `updated_at`, the pages by title after any sort; `mime` is
filtered as the title and the slug are, so `mime_starts_with` of `image/`
is every image. The `search` column the
content migration keeps is still there, and no query reads it. No seed
writes a page: the content is empty until the admin writes one.

`admin.folders` has `list`, `fetch`, `create`, `update` and `delete`, by
`id`, and `parent`, where the folder is, on its own. `list` is the folders
inside the one `parent_id` names, or at the top when it is null, by name,
or by the `name`, `size`, `created_at` or `updated_at` its `sort` names in
`direction`, and each row carries `count`, how many folders and pages the
folder holds itself. Its `size` and `updated_at` are of all that is under
it, however deep: the bytes of every document, and when it, or anything
under it, was last changed. All three are columns of its row, which the
documents migration adds and fills in once, so `list` and `fetch` read a
folder's row and nothing under it, however much that is. They are kept in
step by triggers, `content_carried` on the content and `folders_made` and
`folders_placed` on the folders: a document written, filed elsewhere or
removed, and a folder made, renamed, moved or removed, is carried by
`folders_carry` to the folder it is in and every folder above that, one
row to a level. So a write costs the depth it is made at, and takes the
rows above it for as long as it runs; a document moved leaves its own
`updated_at` as it was and changes both folders. A write of `content` or
`folders` that goes around the queries is carried the same way. `create` takes a name and the folder it is made in; `update`
renames one where it stands; `parent` moves one into another folder, or to
the top, and changes nothing when that folder is the folder itself or one
under it, so no folder is cut loose from the top. `delete` removes a folder
that holds nothing and leaves one that holds anything, which is how the
two tell a caller apart from a folder that is not there: a `fetch` first.
A name is a folder's own among the folders beside it.

`admin.views` has `list`, `save` and `delete`, each of one user's views of
one list: the user named by `sub`, as their session names them, and the
list by `surface`. A view's `id` is a UUID its maker gives it before it is
stored, so `save` is the one write: it writes a new view, or gives the
user's own of that list its new `name` and `payload`, and returns the row
either way. Given the id of a view of another user's, or of another list,
it changes nothing and returns none, as it does for a `sub` no user is
bound to; `delete` removes none then either. The `payload` is `jsonb`, and
the database holds it to no shape: each list's arrangement is its own, and
the admin's API checks it against the surface's schema of `@bbf/schema`
before it is saved. A user removed takes their views along.

`admin.users` has the same, and two more for signing in. A user is added
by their email and a `user_role` — `admin` or `editor`, the roles of
`@bbf/patents` — and is bound to Google's subject (`sub`) the first time
they sign in: `admin.users.claim` binds it to the user added by that
email, when no subject is bound yet, and `admin.users.subject` finds the
user by it on every request after. An `update` that changes the email
unbinds the user until they sign in with the new one. The admin app passes
`claim` only an email Google has verified.

A member's `bio`, an event's `body` and a page's `body` are `jsonb`: the HTML tree (hast)
the app renders, written as the admin's editor hands it over and served to
the site as it is, where a sermon's `body` is the Markdown it was written
as. The events trim migration made the events' bodies so, each paragraph
of what was Markdown a paragraph of the tree, by `hast_paragraphs`, which
the seeds write through too.

An argument written into a column the schema lets be null — a summary, a
bio, a body, an image, an end time, a sermon's `speaker` or `video`, an
event's `weeks` — is optional, and takes `null`; left out, it is null.
Every other argument is required, a sermon's `status` and an event's
`date` and `recurring` among them. Only a recurring event picks its
`weeks`, and the schema refuses anything else. A sermon's `slug` and its `video`,
YouTube's id for its recording, are each taken once; a sermon not yet
recorded has no video, and any number may.

## Roles

A role is `src/roles/<role>.sql`, named for the role, and holds the whole
of its grants: `roles` of bezoar revokes every privilege the role has
before it runs the file, so a grant taken out of the file is gone after
the next run. The build declares each role before the migrations and
applies its grants after them, and then plans every query as every role,
so the contract carries, by role, the queries the role may run.

`web` has `SELECT` on `home`, `about`, `connect`, `content`, `staff`, `events` and `sermons`, and nothing else.
It may run every read of them, the admin app's plain reads among them, and
no write; it may not read `users` at all, nor `folders` or `views`, which the site has no use for yet. `admin` has `SELECT`, `INSERT`,
`UPDATE` and `DELETE` on `content`, `folders`, `staff`, `events`, `sermons`, `users` and `views`, and `SELECT` and `UPDATE` alone on
`home`, `about` and `connect`, whose one row is neither added nor removed, and may run every query. Each `id` is an identity column, which
Postgres fills without a privilege on its sequence, or for a view a UUID it is handed, so the tables are the
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
