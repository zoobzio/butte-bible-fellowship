import type { AppProsaryMessage } from "#imports";

interface FooterLink {
  /** Makes the line a link: a URL, or a `tel:` / `mailto:` address. */
  href?: string;
  target?: "_blank";
}

/** A line of the site's own words: a message of `@bbf/prose`, by key. */
export interface FooterMessageLine extends FooterLink {
  label: AppProsaryMessage;
}

/** A line that reads the same in every language: an address, a number, a name. */
export interface FooterTextLine extends FooterLink {
  text: string;
}

export type FooterLine = FooterMessageLine | FooterTextLine;

export interface FooterColumn {
  title: AppProsaryMessage;
  lines: FooterLine[];
}

export interface FooterConfig {
  columns: FooterColumn[];
}
