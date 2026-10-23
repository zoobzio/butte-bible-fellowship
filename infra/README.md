# infra

The deployment, as Terraform: the Postgres project on Neon, the roles the
apps connect as, and the two Vercel projects with the environment each is
given. One `terraform apply` is the whole of it. What an app needs at build
time, the build command, turbo-ignore and which branches deploy, stays in
the app's `vercel.json`, which Vercel reads from the commit and which
overrides the project's settings; this is the project around it.

## Layout

```
versions.tf       the providers and their versions; where the state lives
providers.tf      how each provider connects: Vercel, Neon, and Postgres as Neon's owner
variables.tf      the team, the repository, the region, and the Neon organization
neon.tf           the Neon project: one branch, one database, its owner
database.tf       the `web` and `admin` groups and the login user of each app
vercel.tf         the two projects and their environment variables
imports.tf        adopts the Vercel project that already exists
outputs.tf        the ids, and the owner's connection string for migrations
tests/            `terraform test`: the roles, the connection strings, the projects
```

This directory is the Terraform module: Terraform reads every `.tf` here,
keeps its lock file, its plugins and its state here, and finds its tests
in `tests/`.

## Database

[`@bbf/database`](../packages/database) names two roles, `web` and
`admin`, and says what each may do; who logs in as one is the deployment's.
Neon grants every role made through its own API membership in
`neon_superuser`, which can read and write every table, so the apps' roles
are made in SQL instead, through the `postgresql` provider connected as the
project's owner:

- `web` and `admin`, groups that cannot log in. bezoar's `roles` skips
  declaring a group that exists and applies the grants to it.
- `bbf_web` and `bbf_admin`, a login user per app, each a member of its
  group alone. A user inherits its group's grants and holds nothing else,
  so it can neither migrate nor grant.

Each app is given its own user as `NUXT_BEZOAR_URL`, over Neon's pooler.
The owner's connection string is the `owner_database_url` output, for
whatever applies the roles, the migrations and the seeds before an app
deploys; it is never an app's.

## Setup

Terraform 1.10 or later, and two tokens in the environment:

```sh
export VERCEL_API_TOKEN=...   # vercel.com/account/tokens, scoped to the team
export NEON_API_KEY=...       # console.neon.tech, Account settings → API keys
```

Then, from this directory:

```sh
cp terraform.tfvars.example terraform.tfvars   # if the Neon project belongs to an organization
terraform init
terraform plan
terraform apply
```

The first apply adopts the existing Vercel project (`imports.tf`) rather
than creating another, so its plan shows the web project as an import with
changes, and everything else as new. Read the changes to the web project
before applying: they are the difference between the dashboard and this
file, and the file wins.

The Vercel token must belong to the team, and Neon's key to the account or
organization that will own the project (`neon_org_id`).

## Tests

```sh
terraform test      # or: make infra-test, from the root
```

The tests run the configuration against mock providers, so they need no
tokens and touch nothing: Neon, Postgres and Vercel are stand-ins that
accept every resource and invent the values a real one would compute,
and the imported web project is overridden the same way. What they check
is the shape of the deployment rather than the providers: that the groups
cannot log in and each app's user is a member of its group alone, that
each app's connection string names its own user over the pooler and
neither another's nor the owner's password, that each project sits at its
app's directory and deploys `main`, and that every project is given its
database.

## State

State is a local `terraform.tfstate` until a backend is chosen, and it
holds every secret here, the database passwords among them. It is
gitignored. Before a second person or a CI job runs this, move it to a
backend: HCP Terraform is free for a small team, or any S3-compatible
bucket. Uncomment and fill in the `backend` block in `versions.tf`, then
`terraform init -migrate-state`.

## Previews

Preview deployments get the production database, as the same user. A
preview of the admin app can therefore write production content. Neon
branches would give each preview its own copy, but that needs a step per
deployment, which Terraform does not take; it is a workflow in
`.github/workflows/preview.yml`, when it is wanted. Until then, drop
`"preview"` from the `target` of `database_url` in `vercel.tf` to deny
previews a database altogether.
