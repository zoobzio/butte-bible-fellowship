import { describe, expect, it } from "vitest";

import { setContentPages, setRoutePath, useHead } from "#imports";
import AboutArticle from "~/components/AboutArticle.vue";
import Page from "~/pages/about-us.vue";
import { mountSuspended } from "#test/support/mount";

const ABOUT = {
  path: "/about-us",
  title: "About – Test Church",
  body: { type: "minimark", value: [["h1", { id: "our-vision" }, "Vision"]] },
};

describe("about us page", () => {
  it("hands its own page to the article, whatever locale the route is in", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/es/about-us");
    const { wrapper } = await mountSuspended(Page);
    expect(wrapper.findComponent(AboutArticle).props("page")).toEqual(ABOUT);
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
    expect(wrapper.findComponent(AboutArticle).exists()).toBe(false);
  });
});
