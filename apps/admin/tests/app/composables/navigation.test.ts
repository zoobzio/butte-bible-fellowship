import { beforeEach, describe, expect, it } from "vitest";

import { setAppConfig, setLocale, setRoutePath, useNuxtApp } from "#imports";
import { useSidebar } from "~/composables/navigation";

beforeEach(() => {
  setAppConfig({
    sidebar: {
      links: [
        { label: "admin.navigation.staff", to: "/staff" },
        { label: "admin.navigation.events", to: "/events" },
      ],
    },
  });
});

describe("useSidebar", () => {
  it("offers each section as a tab that is a link, one under another", () => {
    const { tabs } = useSidebar();
    expect(tabs.value.tabs).toEqual([
      { value: "/staff", label: "Staff", link: { to: "/staff" } },
      { value: "/events", label: "Events", link: { to: "/events" } },
    ]);
    expect(tabs.value.pt).toEqual({ root: { orientation: "vertical" } });
  });

  it("names each section in the reader's language", () => {
    const { tabs } = useSidebar();
    setLocale("es");
    const { $t } = useNuxtApp();
    expect(tabs.value.tabs.map((tab) => tab.label)).toEqual([
      $t.admin.navigation.staff(),
      $t.admin.navigation.events(),
    ]);
  });

  it("marks the section whose page is being read, or a page under it", () => {
    const { tabs } = useSidebar();
    setRoutePath("/events");
    expect(tabs.value.modelValue).toBe("/events");
    setRoutePath("/staff/3");
    expect(tabs.value.modelValue).toBe("/staff");
    setRoutePath("/events/new");
    expect(tabs.value.modelValue).toBe("/events");
  });

  it("marks none on a page of no section", () => {
    setRoutePath("/");
    expect(useSidebar().tabs.value.modelValue).toBeUndefined();
  });
});
