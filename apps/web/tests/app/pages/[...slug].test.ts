import { describe, expect, it } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, setRoutePath, useHead } from "#imports";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/[...slug].vue";
import { mountSuspended } from "#test/support/mount";

const ABOUT = { path: "/about-us", title: "About – Test Church" };
const VISIT = { path: "/visit", title: "Visit – Test Church" };

describe("content page", () => {
  it("renders the page at the current route's path", async () => {
    setContentPages({ "/about-us": ABOUT, "/visit": VISIT });
    setRoutePath("/visit");
    const { wrapper } = await mountSuspended(Page);

    const renderer = wrapper.find("article.prose").findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(VISIT);
  });

  it("renders with the app's markdown components and no prose components", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/about-us");
    const { wrapper } = await mountSuspended(Page);

    const renderer = wrapper.findComponent(ContentRenderer);
    expect(renderer.props("components")).toBe(MARKDOWN_COMPONENTS);
    expect(renderer.props("prose")).toBe(false);
  });

  it("titles the document after the page", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/about-us");
    await mountSuspended(Page);
    expect(useHead.mock.calls[0]![0]()).toEqual({ title: "About – Test Church" });
  });

  it("throws a 404 when no page exists at the path", async () => {
    setContentPages({ "/about-us": ABOUT });
    setRoutePath("/missing");
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      statusMessage: "Page not found",
    });
    expect(wrapper.find(".prose").exists()).toBe(false);
  });
});
