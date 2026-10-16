import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { PageItem } from "~/types/page";

import { Prose } from "#components";
import MarkdownBody from "~/components/MarkdownBody.vue";
import { document, element } from "#test/support/content";

const PAGE: PageItem = {
  title: "About – Test Church",
  body: document(
    { title: "About – Test Church" },
    element("p", {}, "Modern wisdom…"),
  ),
};

describe("MarkdownBody", () => {
  it("hands the page's body to the prosary module's renderer", () => {
    const prose = mount(MarkdownBody, {
      props: { page: PAGE },
    }).findComponent(Prose);
    expect(prose.exists()).toBe(true);
    expect(prose.props("tree")).toEqual(PAGE.body);
  });
});
