import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig, setAuthUser, setLocale } from "#imports";
import { head } from "#test/support/head";
import AppHeader from "#layers/bbf/app/components/AppHeader.vue";
import AccountMenu from "~/components/AccountMenu.vue";
import Layout from "~/layouts/default.vue";

const mountLayout = () =>
  mount(Layout, {
    slots: { default: '<p class="page">Page</p>' },
    global: { stubs: { AppMobileNav: true } },
  });

describe("default layout", () => {
  it("stands the header over the page", () => {
    setAppConfig({ header: { tagline: "admin.site.tag", links: [] } });
    const wrapper = mountLayout();
    expect(wrapper.findComponent(AppHeader).exists()).toBe(true);
    expect(wrapper.find("header.site-header + main.admin-main").exists()).toBe(
      true,
    );
    expect(wrapper.find("main.admin-main .page").text()).toBe("Page");
  });

  it("puts the account menu at the end of the header, once someone is signed in", () => {
    setAppConfig({ header: { tagline: "admin.site.tag", links: [] } });
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const wrapper = mountLayout();
    const menu = wrapper.findComponent(AccountMenu);
    expect(menu.exists()).toBe(true);
    expect(wrapper.find(".site-controls + .account-toggle").element).toBe(
      menu.find("button").element,
    );
  });

  it("marks the document with the reader's language", () => {
    setAppConfig({ header: { tagline: "admin.site.tag", links: [] } });
    mountLayout();
    expect(head()).toEqual({ htmlAttrs: { lang: "en" } });
    setLocale("es");
    expect(head()).toEqual({ htmlAttrs: { lang: "es" } });
  });
});
