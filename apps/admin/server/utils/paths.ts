import type { ContentLocation } from "@bbf/schema/types";

import { contentLocation } from "@bbf/schema";

/**
 * The steps of a path as an address writes it: its names between slashes,
 * each encoded as part of a URL. None for no path, the top. Undefined
 * where a name is not encoded as one, or stands as no step of a path.
 */
export const toLocation = (
  address: string | undefined,
): ContentLocation | undefined => {
  try {
    const steps = (address ?? "")
      .split("/")
      .filter((step) => step !== "")
      .map((step) => decodeURIComponent(step));
    const location = contentLocation.safeParse(steps);
    return location.success ? location.data : undefined;
  } catch {
    return undefined;
  }
};
