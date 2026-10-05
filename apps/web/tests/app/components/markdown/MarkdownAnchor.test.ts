import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import MarkdownAnchor from "~/components/markdown/MarkdownAnchor.vue";

describe("MarkdownAnchor", () => {
  it("renders a link to its href around its content", () => {
    const link = mount(MarkdownAnchor, {
      props: { href: "/calendar" },
      slots: { default: "the weekly schedule" },
    });
    expect(link.element.tagName).toBe("A");
    expect(link.attributes("href")).toBe("/calendar");
    expect(link.text()).toBe("the weekly schedule");
  });

  it("passes the target through", () => {
    const link = mount(MarkdownAnchor, {
      props: { href: "https://example.com", target: "_blank" },
    });
    expect(link.attributes("target")).toBe("_blank");
  });
});
