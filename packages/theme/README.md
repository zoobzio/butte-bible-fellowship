# @bbf/theme

The site's design tokens: the [aurora](https://github.com/zoobzio/untheme/tree/main/presets/aurora)
preset with the site's own tonal ramps, built by
[`@untheme/kit`](https://github.com/zoobzio/untheme/tree/main/packages/kit)
into the modules the untheme runtime consumes.

## Layout

```
untheme.config.ts      the kit config: the resolver, the theme's id, the output directory
bbf.resolver.json      aurora's resolver, by npm:/ reference, with the colors set pointed at ours
tokens/colors/         the ramps the site owns, one file each, in aurora's format
  primary.json           brand blue      seed #0a68ff
  secondary.json         sunset orange   seed #ff9a5c
  tertiary.json          yellow          seed #ffde59
  neutral.json           warm grey       seed #7e7871
  neutral-variant.json   warm grey with a brown cast, for outlines   seed #85776d
```

Everything else is aurora's, untouched: the `error`, `success` and `warning`
ramps, the color roles and their contrast and vibrancy channels, the type
scale, shape, space, elevation, motion, state, blur, stroke, border and
gradient tokens, and all eight modifier axes. The roles only reference ramp
stops, so the dark scheme, contrast and vibrancy follow the site's ramps
without any bindings of ours.

## The contract is aurora's

Our ramp files define exactly the tokens aurora's define — the eleven stops,
and for an accent the muted and vivid columns — and the resolver adds none.
An aurora theme is those same ramp tokens with other values, so every theme
in aurora's catalog applies to this build as a layer. Adding a token, or
dropping a stop, would break that; the tests compare the token set against
aurora's.

## Changing a color

The ramp files are generated, not hand-written. Each is the output of
aurora's generator (`presets/aurora/scripts/generate.mjs` in the untheme
repo) for the seed above: the seed gives hue and chroma, and every ramp
shares aurora's lightness ladder. To change a color, run that generator's
`ramp(name, seed)` with the new seed and replace the file. To take a ramp
from aurora or one of its themes instead, point its entry in the resolver's
`colors` set at that file (`npm:/@untheme/aurora/themes/<id>/colors/<ramp>.json`).

## Exports

- `@bbf/theme/config`: the built `{ theme, input }`. The app passes it to
  `@untheme/nuxt` as the `untheme` option, which renders the static cascade,
  injects the live custom properties, and mirrors each modifier's selected
  context onto `<html>` as `data-<modifier>`. Its declaration exports the
  `Contract` type.
- `@bbf/theme`: the `tokens` and `modifiers` lists, the `isToken` /
  `isModifier` guards, and the `Token`, `Modifier` and `Mod` types.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm test`: rebuilds, then checks the modules against the resolver, our
  ramp files, and aurora's documents.
