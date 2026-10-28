import type { AppProsaryMessage } from "#imports";

/** A section of the admin: its name, and the route that lists its records. */
export interface SidebarLink {
  /** The section's name: a message of `@bbf/prose`, by key. */
  label: AppProsaryMessage;
  to: string;
}

export interface SidebarConfig {
  /** The sections, in display order. */
  links: SidebarLink[];
}
