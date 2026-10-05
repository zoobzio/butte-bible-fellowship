import type { AppFibberMessage } from "#imports";

interface FooterLink {
  /** Makes the line a link: a URL, or a `tel:` / `mailto:` address. */
  href?: string;
  target?: "_blank";
}

/** A line of the site's own words: a message of `@bbf/i18n`, by key. */
export interface FooterMessageLine extends FooterLink {
  label: AppFibberMessage;
}

/** A line that reads the same in every language: an address, a number, a name. */
export interface FooterTextLine extends FooterLink {
  text: string;
}

export type FooterLine = FooterMessageLine | FooterTextLine;

export interface FooterColumn {
  title: AppFibberMessage;
  lines: FooterLine[];
}

export interface FooterConfig {
  columns: FooterColumn[];
}
