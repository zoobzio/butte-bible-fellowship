import type { HeaderConfig } from "#layers/bbf/app/types/navigation";

import { defineAppConfig } from "#imports";

const header: HeaderConfig = {
  tagline: "admin.site.tag",
  links: [
    { label: "admin.navigation.staff", to: "/staff" },
    { label: "admin.navigation.events", to: "/events" },
    { label: "admin.navigation.content", to: "/content" },
  ],
};

export default defineAppConfig({
  header,
});
