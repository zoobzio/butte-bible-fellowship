import { describe, expect, it } from "vitest";

import { ContentRenderer } from "#components";
import { setContentPages, setRoutePath, useHead, useNuxtApp } from "#imports";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import { MARKDOWN_COMPONENTS } from "~/constants/markdown";
import Page from "~/pages/connect.vue";
import { mountSuspended } from "#test/support/mount";

const STAFF = [
  { name: "Jane Doe", role: "Elder", bio: "Has served since 2010." },
  { name: "John Roe", role: "Elder" },
];

const CONNECT = {
  path: "/connect",
  title: "Connect – Test Church",
  staff: STAFF,
  body: { type: "minimark", value: [["p", {}, "Visit us."]] },
};

const mountPage = async (page: object = CONNECT) => {
  setContentPages({ "/connect": page });
  return mountSuspended(Page);
};

describe("connect page", () => {
  it("heads the page with its title and description", async () => {
    const { wrapper } = await mountPage();
    const { $t } = useNuxtApp();
    const header = wrapper.findComponent(PageHeader);
    expect(header.element).toBe(
      wrapper.find(".connect > :first-child").element,
    );
    expect(header.props()).toEqual({
      title: $t.connect.title(),
      description: $t.connect.description(),
    });
  });

  it("leads with the staff, a card each, under the header", async () => {
    const { wrapper } = await mountPage();
    const section = wrapper.find(
      ".connect > .page-header + section.connect-staff",
    );
    expect(section.find("h2").exists()).toBe(false);
    expect(
      section.findAllComponents(StaffCard).map((card) => card.props("member")),
    ).toEqual(STAFF);
  });

  it("renders its own page after the staff, whatever locale the route is in", async () => {
    setRoutePath("/es/connect");
    const { wrapper } = await mountPage();
    const renderer = wrapper
      .find(".connect > .connect-staff + article.prose")
      .findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(CONNECT);
    expect(renderer.props("components")).toBe(MARKDOWN_COMPONENTS);
    expect(renderer.props("prose")).toBe(false);
  });

  it("puts the article straight under the header when the page lists no one", async () => {
    const { wrapper } = await mountPage({ ...CONNECT, staff: undefined });
    expect(wrapper.find(".connect-staff").exists()).toBe(false);
    expect(
      wrapper.find(".connect > .page-header + article.prose").exists(),
    ).toBe(true);
  });

  it("titles the document after the page", async () => {
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Connect – Test Church",
    });
  });

  it("throws a 404 when the page does not exist", async () => {
    const { wrapper, error } = await mountSuspended(Page);
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.find(".connect").exists()).toBe(false);
  });
});
