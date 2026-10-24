# @bbf/patents

The admin's authorization contract as a
[letters-patent](https://github.com/zoobzio/letters-patent) config, built by
`@letters-patent/kit` into typed scope and role vocabularies, a manifest,
and the issuer's endpoints and capabilities.

## Layout

```
patent.config.ts          points at the documents; describes each scope and role
src/resource.json         Protected Resource Metadata (RFC 9728): the scopes
src/claims.json           OIDC claims request (Core §5.5): the user's claims and roles
src/issuers/google.json   Google's discovery document, vendored
.output/                  the kit's output (generated, not committed)
```

Scopes follow the admin's records (`events:*`, `staff:*`, `users:*`); roles
are `admin` and `editor`, the same `user_role` the `users` table of
`@bbf/database` holds. The admin grants each role its scopes. Google publishes no `roles` claim, so the build warns that the
admin must supply roles from its own records. The `resource` URL is a
placeholder until the admin has a domain.

## Exports

- `@bbf/patents`: `type Scope`, `type Role`, `scopes`, `roles`, `isScope`, `isRole`.
- `@bbf/patents/config`: the `contract`, and the `Contract` and `User` types.
- `@bbf/patents/manifest`: each scope, role and claim with a name and description.
- `@bbf/patents/issuers`, `@bbf/patents/issuers/google`: the issuer modules.
- `@bbf/patents/resource.json`: the metadata to serve at `/.well-known/oauth-protected-resource`.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm test`: checks the built modules against the documents.
