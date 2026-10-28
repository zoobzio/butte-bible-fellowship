import type { AppProsaryMessage } from "#imports";

export interface NavigationLink {
  label: AppProsaryMessage;
  to: string;
}

export interface NavigationItem {
  label: string;
  to: string;
  active: boolean;
}
