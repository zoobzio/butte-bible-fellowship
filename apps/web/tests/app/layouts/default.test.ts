import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { setLocale, setRoutePath } from "#imports";
import Layout from "~/layouts/default.vue";

const mountLayout = async ({ path = "/" } = {}) => {
  setRoutePath(path);
  const wrapper = mount(Layout, {
    slots: { default: '<p class="page">Page</p>' },
    global: {
      stubs: {
        AppHeader: true,
        AppInvitation: true,
        AppFooter: true,
      },
    },
  });
  await nextTick();
  return wrapper;
};

const has = (wrapper: ReturnType<typeof mount>, name: string) =>
  wrapper.findComponent({ name }).exists();

describe("default layout", () => {
  it("wraps the page in the header, main and footer", async () => {
    const wrapper = await mountLayout();
    expect(has(wrapper, "AppHeader")).toBe(true);
    expect(has(wrapper, "AppFooter")).toBe(true);
    expect(wrapper.find("main.site-main .page").text()).toBe("Page");
  });

  it("closes every page with the invitation, between the main and the footer", async () => {
    for (const path of ["/", "/about-us", "/connect"]) {
      const wrapper = await mountLayout({ path });
      expect(
        wrapper
          .find("main.site-main + app-invitation-stub + app-footer-stub")
          .exists(),
        path,
      ).toBe(true);
    }
  });

  it("hands the visitor a new invitation when the language they read in changes", async () => {
    const wrapper = await mountLayout({ path: "/about-us" });
    const invitation = () =>
      wrapper.findComponent({ name: "AppInvitation" }).vm.$.uid;
    const before = invitation();

    setRoutePath("/connect");
    await nextTick();
    expect(invitation()).toBe(before);

    setLocale("es");
    await nextTick();
    expect(invitation()).not.toBe(before);
  });
});
