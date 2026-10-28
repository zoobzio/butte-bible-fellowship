// Vitest shim for Nuxt's virtual `#components` module: the part every app of
// the church shares, from the layer, and what the admin's own components use
// besides.

export * from "@bbf/nuxt/testing/components";

// The design system's components the admin's own components use, real: the
// tests exercise them.
export { default as Table } from "@zoobzio/vue/components/table.vue";
export { default as Tabs } from "@zoobzio/vue/components/tabs.vue";
