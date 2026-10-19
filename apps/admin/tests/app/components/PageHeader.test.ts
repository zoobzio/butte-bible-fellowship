import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import PageHeader from "~/components/PageHeader.vue";

describe("PageHeader", () => {
  it("titles the page, and offers the one thing to do beside it", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Staff", to: "/staff/new", action: "New member" },
    });
    expect(wrapper.find("h1.page-header-title").text()).toBe("Staff");
    const action = wrapper.find("a.page-header-action");
    expect(action.attributes("href")).toBe("/staff/new");
    expect(action.text()).toBe("New member");
  });

  it("offers nothing when there is nothing to do", () => {
    const wrapper = mount(PageHeader, { props: { title: "New member" } });
    expect(wrapper.find("h1").text()).toBe("New member");
    expect(wrapper.find("a").exists()).toBe(false);
  });
});
