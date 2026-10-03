import { accessUntheme, defineNuxtPlugin, useUntheme } from "#imports";
import { useCatalog } from "~/composables/catalog";

/**
 * Restores the visitor's chosen theme. The untheme module writes the active
 * theme's id to a cookie whenever one is applied but does not read it back,
 * so this does: when the cookie names a theme other than the one the app
 * booted with, its layer is fetched from the catalog and applied. A server
 * render waits for it, so the response already carries the theme; in the
 * browser — a prerendered page, where no cookie was read — it applies as
 * soon as it arrives without holding up hydration. An id the catalog no
 * longer serves clears the cookie.
 */
export default defineNuxtPlugin({
  name: "bbf:theme",
  dependsOn: ["untheme"],
  setup: async () => {
    const untheme = useUntheme();
    const catalog = useCatalog();
    const { key } = accessUntheme().cookies;

    const id = key.value;
    if (!id || id === untheme.config.theme.id) {
      return;
    }

    const restore = async () => {
      try {
        const layer = await catalog.get(id);
        if (layer) {
          untheme.apply(layer);
        } else {
          key.value = null;
        }
      } catch {
        // A failed request keeps the cookie: the next load tries again.
      }
    };

    if (import.meta.server) {
      await restore();
    } else {
      void restore();
    }
  },
});
