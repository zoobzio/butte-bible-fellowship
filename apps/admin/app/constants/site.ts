import type { SitePageLink } from "~/types/navigation";

/**
 * The pages of the site with a table of their own, in the order the site's
 * navigation leads to them: what each is called, what of it is changed in
 * the admin, and the page that edits it.
 */
export const SITE_PAGES = {
  home: {
    label: "admin.pages.home",
    description: "admin.pages.homeDescription",
    to: "/site/home",
  },
  about: {
    label: "admin.pages.about",
    description: "admin.pages.aboutDescription",
    to: "/site/about-us",
  },
  connect: {
    label: "admin.pages.connect",
    description: "admin.pages.connectDescription",
    to: "/site/connect",
  },
} as const satisfies Record<string, SitePageLink>;

/**
 * The tabs of such a page in the admin, each a page under it: its content,
 * the editor of its metadata and of what is written on it, and nothing
 * else yet.
 */
export const tabs = (page: SitePageLink) =>
  ({ content: `${page.to}/content` }) as const;
