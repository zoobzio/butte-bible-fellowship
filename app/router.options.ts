import type { RouterConfig } from '@nuxt/schema'

// Nuxt navigation is client-side SPA routing, so the scroll position carries
// over between pages. We reset to the top on every navigation — instantly, so
// the `scroll-behavior: smooth` in app.css doesn't animate the reset. In-page
// anchor links still scroll smoothly via that CSS.
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 0 }
    return { left: 0, top: 0, behavior: 'instant' as ScrollBehavior }
  },
}
