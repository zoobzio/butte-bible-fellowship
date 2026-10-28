import type { SidebarConfig } from "~/types/navigation";

import { defineAppConfig } from "#imports";

// The admin's words live in `@bbf/prose`, under `admin`: a `label` here is
// the key of a message there, checked against its contract and resolved
// with `$t(message)` where it is rendered.

// The sections the sidebar offers, in their order: each a kind of content
// the admin edits, at the route that lists it.
const sidebar: SidebarConfig = {
  links: [
    { label: "admin.navigation.staff", to: "/staff" },
    { label: "admin.navigation.events", to: "/events" },
  ],
};

export default defineAppConfig({
  sidebar,
});
