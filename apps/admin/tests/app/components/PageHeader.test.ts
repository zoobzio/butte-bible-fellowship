import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRoutePath } from "#imports";
import PageHeader from "~/components/PageHeader.vue";

const TABS = [
  { label: "Profile", to: "/staff/1/profile" },
  { label: "Sermons", to: "/staff/1/sermons" },
];

describe("PageHeader", () => {
  it("titles the page, and offers the one thing to do beside it", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Staff", to: "/staff/new", action: "New member" },
    });
    expect(wrapper.find("h1.page-header-title").text()).toBe("Staff");
    const action = wrapper.find(".page-header-actions a.page-header-action");
    expect(action.attributes("href")).toBe("/staff/new");
    expect(action.text()).toBe("New member");
  });

  it("offers the one thing to do as a button when it leads to no page, and says when it is asked for", async () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Staff", action: "New member" },
    });
    expect(wrapper.find("a.page-header-action").exists()).toBe(false);
    const action = wrapper.find(".page-header-actions button");
    expect(action.classes()).toEqual(["page-header-action"]);
    expect(action.attributes("type")).toBe("button");
    expect(action.text()).toBe("New member");
    expect(wrapper.emitted("action")).toBeUndefined();
    await action.trigger("click");
    expect(wrapper.emitted("action")).toEqual([[]]);
  });

  it("says what the page is, under its title, when told", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Staff", description: "Who serves the church." },
    });
    const heading = wrapper.find(".page-header-heading");
    expect(heading.find("h1").text()).toBe("Staff");
    expect(heading.find("p.page-header-description").text()).toBe(
      "Who serves the church.",
    );
    expect(
      mount(PageHeader, { props: { title: "Staff" } })
        .find(".page-header-description")
        .exists(),
    ).toBe(false);
  });

  it("takes what else a page offers beside the title, after the link", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Jane Doe", to: "/staff/new", action: "New member" },
      slots: { default: '<button class="menu">Actions</button>' },
    });
    const actions = wrapper.find(".page-header-actions");
    expect(
      [...actions.element.children].map((child) => child.className),
    ).toEqual(["page-header-action", "menu"]);
  });

  it("offers the way back to the page above, over the title", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Jane Doe", back: { label: "Staff", to: "/staff" } },
    });
    const heading = wrapper.find(".page-header-heading");
    expect(
      [...heading.element.children].map((child) => child.className),
    ).toEqual(["page-header-back", "page-header-title"]);
    const back = heading.find("a.page-header-back");
    expect(back.attributes("href")).toBe("/staff");
    expect(back.text()).toBe("Staff");
    expect(back.find("svg").exists()).toBe(false);
    const iconed = mount(PageHeader, {
      props: {
        title: "Jane Doe",
        back: { label: "Staff", to: "/staff", icon: "chevron-left" },
      },
    }).find("a.page-header-back");
    expect(iconed.find("svg").attributes("aria-hidden")).toBe("true");
    expect(iconed.find("use").attributes("href")).toBe("#chevron-left");
    expect(iconed.text()).toBe("Staff");
    expect(
      mount(PageHeader, { props: { title: "Staff" } })
        .find(".page-header-back")
        .exists(),
    ).toBe(false);
  });

  it("offers the record's pages as tabs under the title, each a link", () => {
    setRoutePath("/staff/1/sermons", { id: "1" });
    const wrapper = mount(PageHeader, {
      props: { title: "Jane Doe", tabs: TABS },
    });
    const tabs = wrapper.findAll(".page-header-tabs .f-tabs-trigger");
    expect(
      tabs.map((tab) => [
        tab.element.tagName,
        tab.text(),
        tab.attributes("href"),
        tab.attributes("data-state"),
      ]),
    ).toEqual([
      ["A", "Profile", "/staff/1/profile", "inactive"],
      ["A", "Sermons", "/staff/1/sermons", "active"],
    ]);
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true);
  });

  it("lights the tab of the page being read, or of a page under it", () => {
    setRoutePath("/staff/1/profile/photo", { id: "1" });
    const wrapper = mount(PageHeader, {
      props: { title: "Jane Doe", tabs: TABS },
    });
    expect(wrapper.find('.f-tabs-trigger[data-state="active"]').text()).toBe(
      "Profile",
    );
  });

  it("offers nothing when there is nothing to do", () => {
    const wrapper = mount(PageHeader, { props: { title: "New member" } });
    expect(wrapper.find("h1").text()).toBe("New member");
    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find(".page-header-actions").exists()).toBe(false);
    expect(wrapper.find(".page-header-tabs").exists()).toBe(false);
    expect(
      mount(PageHeader, { props: { title: "New member", tabs: [] } })
        .find(".page-header-tabs")
        .exists(),
    ).toBe(false);
  });
});
