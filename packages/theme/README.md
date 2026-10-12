# @bbf/theme

The site's design tokens: the [aurora](https://github.com/zoobzio/untheme/tree/main/presets/aurora)
preset with the site's own palette as its base, built by
[`@untheme/kit`](https://github.com/zoobzio/untheme/tree/main/packages/kit)
into the modules, the layers and the preset manifest the untheme runtime
consumes. The package is itself a preset: the app names it as
`untheme: { preset: "@bbf/theme" }` and that is the whole setup.

## Layout

```
untheme.config.ts      the kit config: aurora as the source, our palette on top of its ramps
scripts/generate.mjs   the seeds of the palette, and the script that writes src/bbf.json
src/bbf.json           the site's palette: its name, its description and all eight ramps
```

The config names aurora as a preset and extends its `ramps` set with
`src/bbf.json`. The palette joins the set after aurora's own, so its stops
win. Every role of aurora references a ramp stop, and every modifier context
rebinds a role, so the roles, the dark scheme, contrast, vibrancy and every
theme follow the site's ramps without any bindings of ours. Aurora's
thirty-one themes come along as layers, and the site's palette is the first
layer of the build: the one a visitor comes back to.

| Ramp              | Color                                     | Seed      |
| ----------------- | ----------------------------------------- | --------- |
| `primary`         | brand blue                                | `#0a68ff` |
| `secondary`       | sunset orange                             | `#ff9a5c` |
| `tertiary`        | yellow                                    | `#ffde59` |
| `neutral`         | warm grey                                 | `#7e7871` |
| `neutral-variant` | warm grey with a brown cast, for outlines | `#85776d` |

The `error`, `success` and `warning` seeds are aurora's.

Everything else is aurora's, untouched: the color roles and their contrast
and vibrancy channels, the type scale, shape, space, elevation, motion,
state, blur, stroke, border and gradient tokens, and every modifier axis.

## The contract is aurora's

The palette defines exactly the tokens an aurora theme does — the eleven
stops of each ramp, and for an accent the muted and vivid columns — and the
build adds none. A theme is a layer that rebinds those stops, so every aurora
theme applies to the site's theme as it is, and switching between the site's
palette and any of them is `select(id)` on the runtime service. The layer of
`bbf` holds the stops that differ from aurora's, so applying it over any
theme restores the site's colors.

## Changing a color

The ramps are generated, not hand-written. `scripts/generate.mjs` holds one
seed for each ramp and writes `src/bbf.json` with `palette` from
`@untheme/aurora/ramp`, aurora's own generator. The seed gives hue and
chroma, and every ramp shares aurora's lightness ladder, so every stop sits
where aurora's does. To change a color, edit the seed and run:

```sh
pnpm generate && pnpm format
```

## Exports

- `@bbf/theme/config`: the built `{ theme, input }`: the base theme and the
  boot selection. Its declaration exports the `Contract` type.
- `@bbf/theme/manifest`: each modifier and its contexts with an id, a name
  and a description. The app's settings popover lists them.
- `@bbf/theme/layers` and `@bbf/theme/layers/<id>.json`: the layer list —
  `bbf` first, then every aurora theme — and each layer, ready for `apply`.
  The app's theme picker lists the entries, and the Nuxt module imports a
  layer on demand when one is selected.
- `@bbf/theme/preset.json` and `@bbf/theme/resolver.json`: the preset
  manifest and the portable resolver document of the build. Another kit
  config builds on them with `source: "npm:/@bbf/theme"`.
- `@bbf/theme/src/*`: the palette, as DTCG JSON, which the resolver
  references.
- `@bbf/theme`: the `tokens` and `modifiers` lists, the `isToken` /
  `isModifier` guards, and the `Token`, `Modifier`, `Context` and `Mod`
  types.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm generate`: writes `src/bbf.json` from the seeds.
- `pnpm test`: rebuilds, then checks the modules and the layers against our
  palette and aurora's own build.
