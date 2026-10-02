# @bbf/theme

The site's design tokens as [DTCG](https://www.designtokens.org/) JSON,
built by [Terrazzo](https://terrazzo.app) into CSS variables and a JS
resolver.

## Layout

```
resolver.json          DTCG resolver: one base set plus a `color` modifier
tokens/
  palette.json         raw tonal stops (palette.primary.600, …)
  typography.json      font families, weights, sizes, line heights; typography composites
  layout.json          space scale, radii
  motion.json          durations, delay, easings, transitions
  effects.json         elevation shadows, blur, stroke, focus border, brand gradient
  color/light.json     semantic color roles for the light scheme
  color/dark.json      the same roles for the dark scheme
```

Semantic colors (`color.*`) reference the palette and exist only in the
`color` modifier's contexts. Everything else is scheme-independent.

Only tokens the site actually uses are defined. Add a token when you need it.

## Exports

- `@bbf/theme/css`: `:root` declares every token in the light scheme.
  `:root[data-color="dark"]` re-declares only the `color.*` roles.
  Variable names are the token path joined with hyphens, and a group's
  `$root` token takes the group's name (`color.primary.$root` →
  `--color-primary`, `color.primary.container` →
  `--color-primary-container`).
- `@bbf/theme`: `resolver.apply({ color: "dark" })` returns the resolved
  token set.

`gradient.brand` carries stops only. Wrap it where you use it, e.g.
`linear-gradient(108deg, var(--gradient-brand))`.

## Scripts

- `pnpm build`: writes `.output/`. It also runs on install via `prepare`.
- `pnpm lint`: runs `tz check` over the resolver and its sources.
- `pnpm test`: rebuilds, then checks the CSS and JS output against the token sources.
