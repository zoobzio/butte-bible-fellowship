import type { SidebarConfig } from "~/types/navigation";

import { defineAppConfig } from "#imports";

// The sections the sidebar offers, in their order: each a kind of content
// the admin edits, at the route that lists it.
const sidebar: SidebarConfig = {
  links: [
    { label: "Staff", to: "/staff" },
    { label: "Events", to: "/events" },
  ],
};

export default defineAppConfig({
  sidebar,
});
