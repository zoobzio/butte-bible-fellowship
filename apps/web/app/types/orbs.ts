import type { Ref } from "vue";

export interface OrbDriftOptions {
  /** The orb travelling down with scroll. */
  left: Readonly<Ref<HTMLElement | null>>;
  /** The orb travelling up with scroll. */
  right: Readonly<Ref<HTMLElement | null>>;
}
