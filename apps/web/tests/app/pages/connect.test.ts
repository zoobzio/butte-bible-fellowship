import type { Root } from "hast";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setContentPages, setLocale, useHead, useNuxtApp } from "#imports";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import Page from "~/pages/connect.vue";
import { document, element } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const STAFF = [
  {
    slug: "jane-doe",
    name: "Jane Doe",
    role: "Elder",
    summary: "Has served since 2010.",
  },
  { slug: "john-roe", name: "John Roe", role: "Elder" },
];

const CONNECT = document(
  { title: "Connect – Test Church" },
  element("p", {}, "Visit us."),
);

const fetchStaff = vi.fn(async () => STAFF);

beforeEach(() => {
  vi.stubGlobal("$fetch", fetchStaff);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchStaff.mockReset();
  fetchStaff.mockImplementation(async () => STAFF);
});

const mountPage = async (page: Root = CONNECT) => {
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
    expect(fetchStaff).toHaveBeenCalledWith("/api/staff");
    const section = wrapper.find(
      ".connect > .page-header + section.connect-staff",
    );
    expect(section.find("h2").exists()).toBe(false);
    expect(
      section.findAllComponents(StaffCard).map((card) => card.props("member")),
    ).toEqual(STAFF);
  });

  it("renders its own page after the staff, whatever language is read", async () => {
    setLocale("es");
    const { wrapper } = await mountPage();
    expect(
      wrapper
        .find(".connect > .connect-staff + article.prose")
        .findComponent(MarkdownBody)
        .props("page"),
    ).toEqual({ title: "Connect – Test Church", body: CONNECT });
  });

  it("puts the article straight under the header when the API lists no one", async () => {
    fetchStaff.mockImplementation(async () => []);
    const { wrapper } = await mountPage();
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
