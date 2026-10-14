import type { PageCollections } from "@nuxt/content";

/**
 * A page of the site, as its locale's collection hands it: its front matter
 * and its body. Every locale's collection holds the same pages.
 */
export type PageItem = PageCollections[keyof PageCollections];
