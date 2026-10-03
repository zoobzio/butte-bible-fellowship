import { ORB_TRAVEL } from "~/constants/orbs";

/** px an orb has drifted at `progress` through the page, to one decimal. */
export const orbDrift = (progress: number): string =>
  (progress * ORB_TRAVEL).toFixed(1);
