import type { AppearanceRecord } from "@bbf/schema/types";

import { appearanceRecord } from "@bbf/schema";
import { useAsyncData } from "#imports";
import { useApi } from "~/composables/api";
import { APPEARANCE } from "~/composables/settings/routes";
import { isNotFound } from "~/utils/errors";

/**
 * How the site looks over what its theme says, read from the admin's API:
 * there is one of it, so its address names it. Nothing should its row be
 * missing.
 */
export const useAppearanceRecord = () => {
  const api = useApi();

  return useAsyncData(
    "settings:appearance",
    async (): Promise<AppearanceRecord | null> => {
      try {
        return appearanceRecord.parse(await api(APPEARANCE));
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
  );
};
