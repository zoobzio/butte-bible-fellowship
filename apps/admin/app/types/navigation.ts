import type { AppProsaryMessage } from "#imports";

export interface SidebarLink {
  label: AppProsaryMessage;
  to: string;
}

export interface SidebarConfig {
  links: SidebarLink[];
}
