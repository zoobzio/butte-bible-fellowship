import { describe, expect, it } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import TableOfContents from "~/components/TableOfContents.vue";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/about-us.vue";
import { mountSuspended } from "#test/support/mount";

const ABOUT = {
  path: "/about-us",
  title: "About – Test Church",
  body: {
    type: "minimark",
    value: [
      ["h1", { id: "our-vision" }, "Our Vision"],
      ["p", {}, "Modern wisdom…"],
      ["h2", { id: "dreams" }, "Dreams"],
    ],
  },
};

describe("about us page", () => {
  it("renders its own page, whatever locale the route is in", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/es/about-us");
    const { wrapper } = await mountSuspended(Page);

    const renderer = wrapper
      .find("article.prose")
      .findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(ABOUT);
    expect(renderer.props("components")).toBe(MARKDOWN_COMPONENTS);
    expect(renderer.props("prose")).toBe(false);
  });

  it("heads the page with its title and description", async () => {
    setContentPages({ "/about-us": ABOUT });
    const { wrapper } = await mountSuspended(Page);

    const { $t } = useNuxtApp();
    const header = wrapper.findComponent(PageHeader);
    expect(header.element).toBe(wrapper.find(".about > :first-child").element);
    expect(header.props()).toEqual({
      title: $t.about.title(),
      description: $t.about.description(),
    });
    expect(header.find(".page-header-slot").exists()).toBe(false);
  });

  it("lists the page's headings beside it, ahead of the article", async () => {
    setContentPages({ "/about-us": ABOUT });
    const { wrapper } = await mountSuspended(Page);

    const contents = wrapper
      .find(".about > .page-header + aside.about-contents")
      .findComponent(TableOfContents);
    expect(contents.props("entries")).toEqual([
      { id: "our-vision", depth: 1, text: "Our Vision" },
      { id: "dreams", depth: 2, text: "Dreams" },
    ]);
  });

  it("titles the document after the page", async () => {
    setContentPages({ "/about-us": ABOUT });
    await mountSuspended(Page);
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "About – Test Church",
    });
  });

  it("throws a 404 when the page does not exist", async () => {
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.find(".prose").exists()).toBe(false);
  });
});
