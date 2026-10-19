import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import AdminSidebar from "~/components/AdminSidebar.vue";
import Layout from "~/layouts/default.vue";

describe("default layout", () => {
  it("stands the sidebar beside the page", () => {
    const wrapper = mount(Layout, {
      slots: { default: '<p class="page">Page</p>' },
      global: { stubs: { AdminSidebar: true } },
    });
    expect(wrapper.findComponent(AdminSidebar).exists()).toBe(true);
    expect(
      wrapper
        .find(".admin-shell > admin-sidebar-stub + main.admin-main")
        .exists(),
    ).toBe(true);
    expect(wrapper.find("main.admin-main .page").text()).toBe("Page");
  });
});
