import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { setRoutePath, useHead } from "#imports";
import { useColorMode } from "~/composables/theme";
import Layout from "~/layouts/default.vue";
import { stubMatchMedia } from "#test/support/page";

const mountLayout = async ({ mobile = false, path = "/" } = {}) => {
  stubMatchMedia(mobile);
  setRoutePath(path);
  const wrapper = mount(Layout, {
    slots: { default: '<p class="page">Page</p>' },
    global: {
      stubs: { AppHeader: true, AppFooter: true, Orbs: true, Arches: true },
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

  it("binds the color mode to data-color on the html element", async () => {
    await mountLayout();
    const { htmlAttrs } = useHead.mock.calls[0]![0];
    expect(htmlAttrs["data-color"].value).toBe("light");

    useColorMode().set("dark");
    expect(htmlAttrs["data-color"].value).toBe("dark");
  });

  it("shows the orbs and the arches on the home page", async () => {
    const wrapper = await mountLayout({ path: "/" });
    expect(has(wrapper, "Orbs")).toBe(true);
    expect(has(wrapper, "Arches")).toBe(true);
  });

  it("shows the orbs but not the arches on other pages", async () => {
    const wrapper = await mountLayout({ path: "/about-us" });
    expect(has(wrapper, "Orbs")).toBe(true);
    expect(has(wrapper, "Arches")).toBe(false);
  });

  it("drops the arches when navigating away from home", async () => {
    const wrapper = await mountLayout({ path: "/" });
    setRoutePath("/about-us");
    await nextTick();
    expect(has(wrapper, "Arches")).toBe(false);
  });

  it("mounts neither decoration on mobile", async () => {
    const wrapper = await mountLayout({ mobile: true, path: "/" });
    expect(has(wrapper, "Orbs")).toBe(false);
    expect(has(wrapper, "Arches")).toBe(false);
  });
});
