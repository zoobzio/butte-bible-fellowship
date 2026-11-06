import type { HeaderConfig } from "#layers/bbf/app/types/navigation";

import { defineAppConfig } from "#imports";

/* The header every app shares. An app names its own tagline and links. */
const header: HeaderConfig = {
  tagline: "site.tagline",
  links: [],
};

export default defineAppConfig({
  header,
});
