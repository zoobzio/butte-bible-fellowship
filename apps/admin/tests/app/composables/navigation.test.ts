import { describe, expect, it } from "vitest";

import { setRoutePath } from "#imports";
import { usePageTabs } from "~/composables/navigation";

describe("usePageTabs", () => {
  const PAGES = [
    { label: "Profile", to: "/people/1/profile", icon: "user" as const },
    { label: "Sermons", to: "/people/1/sermons" },
  ];

  it("offers each page as a tab that is a link, the one being read marked", () => {
    setRoutePath("/people/1/sermons", { id: "1" });
    const tabs = usePageTabs(() => PAGES);
    expect(tabs.value.tabs).toEqual([
      {
        value: "/people/1/profile",
        label: "Profile",
        icon: "user",
        link: { to: "/people/1/profile" },
      },
      {
        value: "/people/1/sermons",
        label: "Sermons",
        icon: undefined,
        link: { to: "/people/1/sermons" },
      },
    ]);
    expect(tabs.value.modelValue).toBe("/people/1/sermons");
    setRoutePath("/people/1/profile/photo", { id: "1" });
    expect(tabs.value.modelValue).toBe("/people/1/profile");
  });

  it("marks none on a page of no tab, and offers none when given none", () => {
    setRoutePath("/people/1", { id: "1" });
    expect(usePageTabs(() => PAGES).value.modelValue).toBeUndefined();
    const none = usePageTabs(() => undefined);
    expect(none.value.tabs).toEqual([]);
    expect(none.value.modelValue).toBeUndefined();
  });
});
