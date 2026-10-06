import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import PageHeader from "~/components/PageHeader.vue";

describe("PageHeader", () => {
  it("titles the page in its one top-level heading, ruled off beneath", () => {
    const wrapper = mount(PageHeader, { props: { title: "About Us" } });
    const title = wrapper.find("header.page-header > h1.page-title");
    expect(title.text()).toBe("About Us");
    expect(wrapper.find("h1 + hr").exists()).toBe(true);
  });

  it("describes the page under its title when it is given a description", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Sermons", description: "The latest messages." },
    });
    expect(wrapper.find("hr + p").text()).toBe("The latest messages.");
  });

  it("renders what it is handed after the title and description", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Sermons", description: "The latest messages." },
      slots: { default: '<div class="highlight" />' },
    });
    expect(wrapper.find("p + .page-header-slot > .highlight").exists()).toBe(
      true,
    );
  });

  it("leaves out the description and the slot it was not given", () => {
    const wrapper = mount(PageHeader, { props: { title: "About Us" } });
    expect(wrapper.find("p").exists()).toBe(false);
    expect(wrapper.find(".page-header-slot").exists()).toBe(false);
  });
});
