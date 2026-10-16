import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { PageItem } from "~/types/page";

import { useNuxtApp } from "#imports";
import AboutArticle from "~/components/AboutArticle.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import TableOfContents from "~/components/TableOfContents.vue";
import { document, element } from "#test/support/content";

const ABOUT: PageItem = {
  title: "About – Test Church",
  body: document(
    { title: "About – Test Church" },
    element("h1", { id: "our-vision" }, "Our Vision"),
    element("p", {}, "Modern wisdom…"),
    element("h2", { id: "dreams" }, "Dreams"),
  ),
};

const { $t } = useNuxtApp();

const mountAbout = (page = ABOUT) => mount(AboutArticle, { props: { page } });

describe("AboutArticle", () => {
  it("renders the page as markdown in the article", () => {
    expect(
      mountAbout()
        .find("article.prose")
        .findComponent(MarkdownBody)
        .props("page"),
    ).toEqual(ABOUT);
  });

  it("heads the page with its title and description", () => {
    const wrapper = mountAbout();
    const header = wrapper.findComponent(PageHeader);
    expect(header.element).toBe(wrapper.find(".about > :first-child").element);
    expect(header.props()).toEqual({
      title: $t.about.title(),
      description: $t.about.description(),
    });
    expect(header.find(".page-header-slot").exists()).toBe(false);
  });

  it("lists the page's headings beside it, ahead of the article", () => {
    const contents = mountAbout()
      .find(".about > .page-header + aside.about-contents")
      .findComponent(TableOfContents);
    expect(contents.props("entries")).toEqual([
      { id: "our-vision", depth: 1, text: "Our Vision" },
      { id: "dreams", depth: 2, text: "Dreams" },
    ]);
  });
});
