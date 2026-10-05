# @bbf/theme

The site's design tokens: the [aurora](https://github.com/zoobzio/untheme/tree/main/presets/aurora)
preset with the site's own palette added to its `theme` modifier, built by
[`@untheme/kit`](https://github.com/zoobzio/untheme/tree/main/packages/kit)
into the modules the untheme runtime consumes.

## Layout

```
untheme.config.ts      the kit config: aurora's resolver, the theme's id, our theme context
src/bbf.json           the site's palette: its name, its description and all eight ramps
```

The config points at aurora's resolver by `npm:/` reference and adds one
context, `bbf`, to its `theme` modifier, booted by default. `src/bbf.json` is
that context, in the format of aurora's own theme files: the name and
description the manifest lists it under, then the ramps.

| Ramp              | Color                                     | Seed      |
| ----------------- | ----------------------------------------- | --------- |
| `primary`         | brand blue                                | `#0a68ff` |
| `secondary`       | sunset orange                             | `#ff9a5c` |
| `tertiary`        | yellow                                    | `#ffde59` |
| `neutral`         | warm grey                                 | `#7e7871` |
| `neutral-variant` | warm grey with a brown cast, for outlines | `#85776d` |

The `error`, `success` and `warning` ramps are the ones aurora's own palette
ships, copied in.

Everything else is aurora's, untouched: the color roles and their contrast
and vibrancy channels, the type scale, shape, space, elevation, motion,
state, blur, stroke, border and gradient tokens, and every modifier axis. The
roles only reference ramp stops, so the dark scheme, contrast and vibrancy
follow the site's ramps without any bindings of ours.

## The contract is aurora's

A context may only rebind tokens the base defines, so our palette defines
exactly the tokens an aurora theme does — the eleven stops, and for an accent
the muted and vivid columns — and the build adds none. Every aurora theme is
a context of the same modifier, so switching between the site's palette and
any of them is `swap("theme", id)`. To offer fewer, list the ones to keep
under `modifiers.theme.contexts` in the config.

## Changing a color

The ramps are generated, not hand-written. Each is the output of aurora's
generator (`presets/aurora/scripts/generate.mjs` in the untheme repo) for
the seed above: the seed gives hue and chroma, and every ramp shares
aurora's lightness ladder. To change a color, run that generator's
`ramp(name, seed)` with the new seed and replace that ramp's tokens in
`src/bbf.json`.

## Exports

- `@bbf/theme/config`: the built `{ theme, input }`. The app passes it to
  `@untheme/nuxt` as the `untheme` option, which renders the static cascade,
  injects the live custom properties, and mirrors each modifier's selected
  context onto `<html>` as `data-<modifier>`. Its declaration exports the
  `Contract` type.
- `@bbf/theme/manifest`: each modifier and its contexts with an id, a name
  and a description. The app's theme picker lists the `theme` modifier's.
- `@bbf/theme`: the `tokens` and `modifiers` lists, the `isToken` /
  `isModifier` guards, and the `Token`, `Modifier` and `Mod` types.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm test`: rebuilds, then checks the modules against our palette and
  aurora's documents.
