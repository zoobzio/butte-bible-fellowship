# @bbf/icons

The site's icons as an [icon-sheets](https://github.com/zoobzio/icon-sheets)
config, built by `@icon-sheets/kit` into a resolved contract, a typed alias
union, and SVG sprites.

## Layout

```
icon-sheets.config.ts  each alias mapped to its Iconify ref or local file
src/logo.svg           the site's mark, drawn in currentColor
.output/               the kit's output (generated, not committed)
```

Aliases name an icon by role (`menu`, `sun`), and the ref behind each one
(`lucide:menu`) resolves from the locally installed `@iconify-json/*`
package. To draw from another collection, install its `@iconify-json/*`
package here.

A ref starting with `./` is a local SVG, relative to this package: `logo`
points at `src/logo.svg`. The file is used as drawn, so keep it a plain
export with a `viewBox` and no editor namespaces, and paint it with
`currentColor` so the app can colour it with CSS (the header gives the
logo `var(--primary)`).

`src/logo.svg` is the mark alone — the disc with the cross and open book
centred in it — cut from the traced logo, whose lettering does not survive
icon sizes. Its `viewBox` is the disc's own bounds, so the disc fills
whatever box it is given. `@bbf/assets` renders the favicon from it.

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

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm test`: rebuilds, then checks the output against the config and its Iconify sources.
