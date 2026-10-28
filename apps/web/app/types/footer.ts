import type { AppProsaryMessage } from "#imports";

interface FooterLink {
  href?: string;
  target?: "_blank";
}

export interface FooterMessageLine extends FooterLink {
  label: AppProsaryMessage;
}

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
