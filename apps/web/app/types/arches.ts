import type { Ref } from "vue";

/** One line's geometry, in ARCH_VB_W units. */
export interface ArchLineConfig {
  legX: number;
  crownX: number;
  span: number;
  drift: number;
}

export interface ArchLinePath {
  /** The full path: arch plus switchbacks down to endY. */
  d: string;
  /** The arch-only prefix, for measuring where the load-in draw settles. */
  arch: string;
}

/** The box a line's arch is drawn against, in document px. */
export interface ArchBounds {
  top: number;
  bottom: number;
}

export type ArchLineKey = "A" | "B";

export interface ArchLineMeta {
  el: SVGPathElement;
  len: number;
  stop: number;
}

export interface ArchLinesOptions {
  track: Readonly<Ref<HTMLDivElement | null>>;
  svg: Readonly<Ref<SVGSVGElement | null>>;
  pathA: Readonly<Ref<SVGPathElement | null>>;
  pathB: Readonly<Ref<SVGPathElement | null>>;
}
