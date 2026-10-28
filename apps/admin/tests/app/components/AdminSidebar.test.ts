import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import { setAppConfig, setAuthUser, setRoutePath } from "#imports";
import AccountPanel from "~/components/AccountPanel.vue";
import AdminSidebar from "~/components/AdminSidebar.vue";

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

const links = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll(".admin-nav a").map((link) => ({
    href: link.attributes("href"),
    text: link.text(),
    active: link.attributes("data-state") === "active",
  }));

describe("AdminSidebar", () => {
  it("names the site over its sections, the brand the way home", () => {
    const wrapper = mount(AdminSidebar);
    const brand = wrapper.find("a.admin-brand");
    expect(brand.attributes("href")).toBe("/");
    expect(brand.find("use").attributes("href")).toBe("#logo");
    expect(brand.find(".admin-brand-name").text()).toBe(
      "Butte Bible Fellowship",
    );
    expect(brand.find(".admin-brand-tag").text()).toBe("Admin");
    expect(wrapper.find("nav.admin-nav").attributes("aria-label")).toBe(
      "Sections",
    );
  });

  it("offers each section as a link, the one being read marked", async () => {
    setRoutePath("/events/2");
    const wrapper = mount(AdminSidebar);
    await vi.waitFor(() => expect(links(wrapper)).toHaveLength(2));
    expect(links(wrapper)).toEqual([
      { href: "/staff", text: "Staff", active: false },
      { href: "/events", text: "Events", active: true },
    ]);
  });

  it("marks the section the reader moves to", async () => {
    setRoutePath("/staff");
    const wrapper = mount(AdminSidebar);
    await vi.waitFor(() => expect(links(wrapper)[0]?.active).toBe(true));
    setRoutePath("/events");
    await nextTick();
    await vi.waitFor(() => expect(links(wrapper)[1]?.active).toBe(true));
    expect(links(wrapper)[0]?.active).toBe(false);
  });

  it("stands the sections one under another", () => {
    const wrapper = mount(AdminSidebar);
    expect(wrapper.find(".f-tabs-root").attributes("data-orientation")).toBe(
      "vertical",
    );
  });

  it("offers no account panel until someone is signed in", () => {
    const wrapper = mount(AdminSidebar, {
      global: { stubs: { AccountPanel: true } },
    });
    expect(wrapper.find(".admin-account").exists()).toBe(false);
    expect(wrapper.findComponent(AccountPanel).exists()).toBe(false);
  });

  it("stands the account panel at its foot once someone is signed in", () => {
    setAuthUser({ sub: "u", name: "Pastor Name", email: "pastor@example.com" });
    const wrapper = mount(AdminSidebar, {
      global: { stubs: { AccountPanel: true } },
    });
    expect(
      wrapper.find(".admin-sidebar > .admin-account:last-child").exists(),
    ).toBe(true);
    expect(
      wrapper.find(".admin-account").findComponent(AccountPanel).exists(),
    ).toBe(true);
  });
});
