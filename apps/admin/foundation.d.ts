/*
 * The design system's app-level types: `$log` and `$logger` on the Nuxt
 * app, and its widgets' events on `RuntimeNuxtHooks`. The layer's own
 * `app/app.d.ts` declares them, but TypeScript leaves node_modules out of
 * the layer's include glob, so the file reaches the typecheck only by name.
 */
import "./node_modules/@zoobzio/foundation/app/app";
