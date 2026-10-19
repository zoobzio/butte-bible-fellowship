/** A section of the admin: its name, and the route that lists its records. */
export interface SidebarLink {
  label: string;
  to: string;
}

export interface SidebarConfig {
  /** The sections, in display order. */
  links: SidebarLink[];
}
