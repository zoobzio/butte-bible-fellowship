import type { RouterConfig } from "@nuxt/schema";

/** How much of the viewport's top the sticky header covers. */
const headerHeight = () =>
  document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;

/** The room left between the header and an anchor it stops over, in px. */
const ANCHOR_GAP = 24;

export default <RouterConfig>{
  scrollBehavior(to, _, savedPosition) {
    if (savedPosition) return savedPosition;
    // An anchor lands under the header, not behind it, with room to breathe.
    if (to.hash) return { el: to.hash, top: headerHeight() + ANCHOR_GAP };
    return { left: 0, top: 0, behavior: "instant" as ScrollBehavior };
  },
};
