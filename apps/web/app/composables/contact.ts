import type { ConnectPage } from "@bbf/schema/types";

import { computed } from "#imports";
import { toConnect } from "~/utils/contact";

/**
 * How to find and reach the church, as the connect page says it, read from
 * the page's front matter as it stands: nothing while there is no page.
 */
export const useConnect = (page: () => ConnectPage | null | undefined) =>
  computed(() => {
    const read = page();
    return read ? toConnect(read) : undefined;
  });
