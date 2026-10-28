import type { SidebarConfig } from "~/types/navigation";

import { defineAppConfig } from "#imports";

const sidebar: SidebarConfig = {
  links: [
    { label: "admin.navigation.staff", to: "/staff" },
    { label: "admin.navigation.events", to: "/events" },
  ],
};

export default defineAppConfig({
  sidebar,
});
