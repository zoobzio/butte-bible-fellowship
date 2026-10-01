# @bbf/icons

The site's icons as an [icon-sheets](https://github.com/zoobzio/icon-sheets)
config, built by `@icon-sheets/kit` into a resolved contract, a typed alias
union, and SVG sprites.

## Layout

```
icon-sheets.config.ts  each alias mapped to its Iconify ref
dist/                  the kit's output (generated, not committed)
```

Aliases name an icon by role (`menu`, `sun`), and the ref behind each one
(`lucide:menu`) resolves from the locally installed `@iconify-json/*`
package. To draw from another collection, install its `@iconify-json/*`
package here.

Only icons the site actually uses are defined. Add an alias when you need it.

## Exports

- `@bbf/icons`: `type Alias`, `aliases`, `isAlias`, `prefix`, `href`.
- `@bbf/icons/config`: the resolved contract.
- `@bbf/icons/sets`: the resolved sets, keyed by id.
- `@bbf/icons/sheet`: the hidden sprite markup, for inlining.
- `@bbf/icons/sprite.svg`: the standalone sprite file.

The web app hands `config`, `sets` and `prefix` to `@icon-sheets/nuxt` in
`nuxt.config.ts`, which inlines the sprite and registers `<Icon name="…" />`.
Nuxt reads the built output when it loads its config, so restart `pnpm dev`
after rebuilding this package.

## Scripts

- `pnpm build`: writes `dist/`. It also runs on install via `prepare`.
