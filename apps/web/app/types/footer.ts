export interface FooterLine {
  label: string;
  /** Makes the line a link: a URL, or a `tel:` / `mailto:` address. */
  href?: string;
  target?: "_blank";
}

export interface FooterColumn {
  title: string;
  lines: FooterLine[];
}

export interface FooterConfig {
  columns: FooterColumn[];
}
