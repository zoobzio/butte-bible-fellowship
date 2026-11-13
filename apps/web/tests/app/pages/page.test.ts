import { describe, expect, it } from "vitest";

import { setContentPages, setRoutePath, useHead } from "#imports";
import MarkdownBody from "~/components/MarkdownBody.vue";
import Page from "~/pages/[page].vue";
import { document, element } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const MEMBERSHIP = document(
  { title: "Membership – Test Church" },
  element("h1", { id: "membership" }, "Membership"),
);

describe("a page the admin wrote", () => {
  it("renders the page its address names, as it is written", async () => {
    setContentPages({ "/membership": MEMBERSHIP });
    setRoutePath("/membership");
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.find("article.prose").exists()).toBe(true);
    expect(wrapper.findComponent(MarkdownBody).props("page")).toEqual({
      title: "Membership – Test Church",
      body: MEMBERSHIP,
    });
  });

  it("titles the document after the page", async () => {
    setContentPages({ "/membership": MEMBERSHIP });
    setRoutePath("/membership");
    await mountSuspended(Page);
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Membership – Test Church",
    });
  });

  it("throws a 404 when no page is written at the address", async () => {
    setRoutePath("/nothing-here");
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.findComponent(MarkdownBody).exists()).toBe(false);
  });
});
