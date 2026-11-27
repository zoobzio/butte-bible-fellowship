import type { HeaderConfig } from "#layers/bbf/app/types/navigation";

import { defineAppConfig } from "#imports";

const header: HeaderConfig = {
  tagline: "admin.site.tag",
  links: [
    { label: "admin.navigation.site", to: "/site" },
    { label: "admin.navigation.content", to: "/content" },
    { label: "admin.navigation.people", to: "/people" },
    { label: "admin.navigation.events", to: "/events" },
    { label: "admin.navigation.sermons", to: "/sermons" },
    { label: "admin.navigation.settings", to: "/settings" },
  ],
};

export default defineAppConfig({
  header,
});
