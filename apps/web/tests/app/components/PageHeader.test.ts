import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setRouteBack, setRoutePath, useRouter } from "#imports";
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

  it("has no way back unless it is given a label for one", () => {
    const wrapper = mount(PageHeader, { props: { title: "About Us" } });
    expect(wrapper.find(".page-header-back").exists()).toBe(false);
  });

  it("leads the title with the way back, under the label it is given", () => {
    setRoutePath("/events/potluck");
    const wrapper = mount(PageHeader, {
      props: { title: "Potluck", back: "Back" },
    });
    const back = wrapper.find("header.page-header > a.page-header-back");
    expect(back.text()).toBe("Back");
    expect(back.find("use").attributes("href")).toBe("#chevron-left");
    expect(back.find("svg").attributes("aria-hidden")).toBe("true");
    expect(back.element.nextElementSibling).toBe(wrapper.find("h1").element);
  });

  it("addresses the way back to the page this one is under, in the route's locale", () => {
    setRoutePath("/es/events/potluck");
    const wrapper = mount(PageHeader, {
      props: { title: "Potluck", back: "Volver" },
    });
    expect(wrapper.find(".page-header-back").attributes("href")).toBe(
      "/es/events",
    );
  });

  it("steps back to the page that brought the reader here", async () => {
    setRoutePath("/events/potluck");
    setRouteBack("/");
    const wrapper = mount(PageHeader, {
      props: { title: "Potluck", back: "Back" },
    });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    wrapper.find(".page-header-back").element.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(useRouter().back).toHaveBeenCalledOnce();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("goes to the page this one is under when no page brought the reader here", async () => {
    setRoutePath("/events/potluck");
    const wrapper = mount(PageHeader, {
      props: { title: "Potluck", back: "Back" },
    });
    await wrapper.find(".page-header-back").trigger("click");
    expect(useRouter().push).toHaveBeenCalledExactlyOnceWith("/events");
    expect(useRouter().back).not.toHaveBeenCalled();
  });

  it("leaves a click that opens the link elsewhere to the browser", () => {
    setRoutePath("/events/potluck");
    setRouteBack("/");
    const wrapper = mount(PageHeader, {
      props: { title: "Potluck", back: "Back" },
    });
    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    wrapper.find(".page-header-back").element.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(useRouter().back).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });
});
