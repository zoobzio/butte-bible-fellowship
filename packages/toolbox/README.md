# @bbf/toolbox

The one copy of the configuration the workspace's packages share. A package
takes `@bbf/toolbox` as a dev dependency and extends what it needs from
here; nothing is duplicated between packages.

## Layout

```
src/oxlint/base.json      the rules every file is linted by
src/oxlint/nuxt.json      base, plus the layer DAG a Nuxt app or layer is held to
src/tsconfig/base.json    the compiler options a plain TypeScript package checks with
src/vitest/nuxt-app.ts    nuxtApp: the vitest config a Nuxt app extending @bbf/nuxt tests with
src/vitest/package.ts     plainPackage: the vitest config a plain TypeScript package tests with
```

## Use

oxlint resolves `extends` as a path relative to the config, so a package
reaches the toolbox through its own `node_modules`, by the file's path under
`src/` (a path, unlike a specifier, does not go through `exports`):

```json
{
  "$schema": "../../node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@bbf/toolbox/src/oxlint/nuxt.json"]
}
```

TypeScript resolves `extends` as a package, so a package names it:

```json
{
  "extends": "@bbf/toolbox/tsconfig/base.json",
  "compilerOptions": { "types": ["node"] },
  "include": ["src", "tests"]
}
```

`base.json` sets no `types`; a package that runs on Node adds `["node"]`.

vitest configs are functions. A Nuxt app hands `nuxtApp` its own URL, which
the aliases (`~`, `~~`, `#test`, the mocks) are resolved against:

```ts
import { nuxtApp } from "@bbf/toolbox/vitest/nuxt-app";

export default nuxtApp(import.meta.url);
```

A plain package runs its `tests/` on Node, and passes `plainPackage` what it
needs on top:

```ts
import { plainPackage } from "@bbf/toolbox/vitest/package";

export default plainPackage({ test: { testTimeout: 30_000 } });
```
