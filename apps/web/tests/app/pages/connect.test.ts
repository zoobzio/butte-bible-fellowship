import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requestedDocuments, setContentPages, useHead } from "#imports";
import ConnectCard from "~/components/ConnectCard.vue";
import ConnectGrid from "~/components/ConnectGrid.vue";
import MapEmbed from "~/components/MapEmbed.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import Page from "~/pages/connect.vue";
import { mapSrc } from "~/utils/contact";
import { document, element } from "#test/support/content";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const STAFF = [
  {
    id: 1,
    name: "Jane Doe",
    role: "elder",
    summary: "Has served since 2010.",
  },
  { id: 2, name: "John Roe", role: "elder" },
];

const ADDRESS = "1 Test Street, Testville, California 90000";

const MATTER = {
  title: "Connect",
  description: "We’d love to meet you.",
  address: ADDRESS,
  phone: "555-010-0100",
  fax: "555-010-0199",
  email: "office@test.example",
  hours:
    "Tuesday–Thursday: 9am–4pm\nFriday: 9am–noon\nSaturday, Sunday, Monday: closed",
};

const CONNECT = document(MATTER);

const fetchStaff = vi.fn(async () => STAFF);

beforeEach(() => {
  vi.stubGlobal("$fetch", fetchStaff);
  setContentPages({ "/connect": CONNECT });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchStaff.mockReset();
  fetchStaff.mockImplementation(async () => STAFF);
});

const mountPage = () => mountSuspended(Page);

describe("connect page", () => {
  it("heads the page with the title and description its own row carries", async () => {
    const { wrapper } = await mountPage();
    expect(requestedDocuments).toEqual(["en/connect.json"]);
    const header = wrapper.findComponent(PageHeader);
    expect(header.element).toBe(
      wrapper.find(".connect > :first-child").element,
    );
    expect(header.props()).toEqual({
      title: "Connect",
      description: "We’d love to meet you.",
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

  it("says how to reach the church after the staff, as the admin wrote it, under the interface's own headings and labels", async () => {
    const { wrapper } = await mountPage();
    const article = wrapper.find(".connect > .connect-staff + article.prose");
    const cards = article
      .findComponent(ConnectGrid)
      .findAllComponents(ConnectCard);
    expect(cards.map((card) => card.find("h2").text())).toEqual([
      "Visit Us",
      "Office Hours",
    ]);
    // Each line is its label, then what it names.
    const lines = cards[0]!.findAll("p");
    expect(lines.map((line) => line.find("strong").text())).toEqual([
      "Address:",
      "Phone:",
      "Fax:",
      "Email:",
    ]);
    expect(
      lines.map((line) =>
        line.text().slice(line.find("strong").text().length).trim(),
      ),
    ).toEqual([ADDRESS, "555-010-0100", "555-010-0199", "office@test.example"]);
    expect(
      cards[0]!.findAll("a").map((link) => link.attributes("href")),
    ).toEqual(["tel:5550100100", "mailto:office@test.example"]);
    // A line of the hours as they were written is a line of the card.
    expect(cards[1]!.findAll("p").map((line) => line.text())).toEqual([
      "Tuesday–Thursday: 9am–4pm",
      "Friday: 9am–noon",
      "Saturday, Sunday, Monday: closed",
    ]);
  });

  it("says nothing of what the admin left out: an address alone, and no card of hours", async () => {
    setContentPages({
      "/connect": document({ title: "Connect", address: ADDRESS }),
    });
    const { wrapper } = await mountPage();
    const cards = wrapper.findAllComponents(ConnectCard);
    expect(cards.map((card) => card.find("h2").text())).toEqual(["Visit Us"]);
    expect(cards[0]!.findAll("p").map((line) => line.text())).toEqual([
      `Address: ${ADDRESS}`,
    ]);
    expect(wrapper.findComponent(PageHeader).props("description")).toBe(
      undefined,
    );
  });

  it("maps the way to the church under the cards, from its address", async () => {
    const { wrapper } = await mountPage();
    const map = wrapper.find(".connect-grid + iframe").element;
    expect(wrapper.findComponent(MapEmbed).element).toBe(map);
    expect(wrapper.findComponent(MapEmbed).props()).toEqual({
      src: mapSrc(ADDRESS),
      title: `Map to ${ADDRESS}`,
    });
  });

  it("draws what is written on the page over the cards, and nothing there when nothing is written", async () => {
    const bare = await mountPage();
    expect(bare.wrapper.findComponent(MarkdownBody).exists()).toBe(false);
    expect(
      bare.wrapper.find("article.prose > :first-child").classes(),
    ).toContain("connect-grid");

    const written = document(MATTER, element("p", {}, "Come and see."));
    setContentPages({ "/connect": written });
    const { wrapper } = await mountPage();
    expect(wrapper.findComponent(MarkdownBody).props("page")).toEqual({
      ...MATTER,
      body: written,
    });
    // What is written stands first in the article, over the cards.
    expect(
      wrapper.find("article.prose > .prose-document + .connect-grid").exists(),
    ).toBe(true);
  });

  it("puts the article straight under the header when the API lists no one", async () => {
    fetchStaff.mockImplementation(async () => []);
    const { wrapper } = await mountPage();
    expect(wrapper.find(".connect-staff").exists()).toBe(false);
    expect(
      wrapper.find(".connect > .page-header + article.prose").exists(),
    ).toBe(true);
  });

  it("titles the document after the page, then the church, as the other pages' tabs read", async () => {
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Connect – Butte Bible Fellowship",
    });
  });

  it("throws a 404 when the page's row is missing", async () => {
    setContentPages({});
    const { wrapper, error } = await mountPage();
    expect(error).toMatchObject({
      statusCode: 404,
      message: "Page not found",
    });
    expect(wrapper.find(".connect").exists()).toBe(false);
  });
});
